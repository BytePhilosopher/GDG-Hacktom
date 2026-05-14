# Smart Gas Queue — System Workflow & Database Schema Guide

> **Purpose:** This document describes how the application works end-to-end, what data flows through each feature, and provides a complete database schema ready for implementation with any relational database (PostgreSQL recommended).

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles](#2-user-roles)
3. [Feature Workflows](#3-feature-workflows)
   - 3.1 [Registration (Driver)](#31-registration-driver)
   - 3.2 [Login & Role-Based Redirect](#32-login--role-based-redirect)
   - 3.3 [Station Discovery (Map)](#33-station-discovery-map)
   - 3.4 [Join Queue + Advance Payment](#34-join-queue--advance-payment)
   - 3.5 [Queue Position Tracking](#35-queue-position-tracking)
   - 3.6 [Cancel Queue](#36-cancel-queue)
   - 3.7 [Admin — Live Queue Management](#37-admin--live-queue-management)
   - 3.8 [Admin — Fuel Inventory](#38-admin--fuel-inventory)
4. [Data Inputs & Outputs per Feature](#4-data-inputs--outputs-per-feature)
5. [Database Schema](#5-database-schema)
6. [Entity Relationships](#6-entity-relationships)
7. [Enum Reference](#7-enum-reference)
8. [API Endpoint Map](#8-api-endpoint-map)

---

## 1. System Overview

Smart Gas Queue is a digital queue management system for fuel stations in Ethiopia. It eliminates physical queuing by letting drivers reserve a spot in a station's fuel queue from their phone, pay 25% in advance via Chapa, and track their position in real time.

**Two interfaces:**

| Interface | Users | Entry Point |
|-----------|-------|-------------|
| Driver App | Registered drivers | `/` (map) → `/login` → `/dashboard` |
| Admin Panel | Station managers | `/login` → `/admin` (role-based redirect) |

**Core technology stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Socket.io, Chapa payment gateway.

---

## 2. User Roles

| Role | Description | Created By |
|------|-------------|------------|
| `driver` | Regular user who joins fuel queues | Self-registration via `/register` |
| `station_admin` | Gas station manager who manages queues and fuel | Developer-provisioned (no self-registration) |

---

## 3. Feature Workflows

### 3.1 Registration (Driver)

```
Driver fills form → Validation → Account created → JWT issued → Redirect to /
```

**Steps:**
1. Driver visits `/register`
2. Submits: full name, phone, email, plate number, vehicle type, license number, password
3. Server validates (unique email, phone format, password strength)
4. Password hashed (bcrypt), user record created
5. JWT token issued and stored in `localStorage` as `auth_token`
6. User object cached in `localStorage` as `auth_user`
7. Redirect to `/` (map page)

---

### 3.2 Login & Role-Based Redirect

```
User submits credentials → Auth check → Role detected → Redirect
```

**Steps:**
1. User visits `/login` (same page for both roles)
2. Submits email + password
3. Server verifies credentials, returns `{ user, token }`
4. Client checks `user.role`:
   - `driver` → redirect to `/` (or `?redirect=` param if set)
   - `station_admin` → redirect to `/admin`
5. Token stored as `auth_token`, user as `auth_user` in `localStorage`

**Session persistence:** On app load, `auth_token` is read from `localStorage` and verified via `GET /api/auth/me`. If valid, user is restored without re-login.

---

### 3.3 Station Discovery (Map)

```
Browser geolocation → Nearby stations fetched → Pins on map → Station popup
```

**Steps:**
1. App requests browser geolocation on load
2. On location ready: `GET /api/stations/nearby?lat=&lng=&radius=10000`
3. Stations returned sorted by distance, with fuel availability and queue size
4. Stations rendered as map pins via Google Maps API
5. Driver taps a pin → `StationPopup` shows station name, fuels, queue size, distance
6. Driver taps "Join Queue" → if not logged in, redirect to `/login?redirect=/station/{id}/queue`; if logged in, go directly to `/station/{id}/queue`

---

### 3.4 Join Queue + Advance Payment

```
Select fuel → Calculate price → Submit → Queue entry created → Chapa payment → Redirect back → Verify → Queue confirmed
```

**Steps:**
1. Driver visits `/station/{stationId}/queue`
2. Station loaded via `GET /api/stations/{id}`
3. Driver selects: fuel type, quantity (liters)
4. App calculates: `totalPrice = liters × pricePerLiter`, `advancePayment = totalPrice × 0.25`
5. Driver submits form
6. `POST /api/queue/join` → creates queue entry with `status: 'pending'`, `paymentStatus: 'pending'`
7. `POST /api/payments/initialize` → creates Chapa payment, returns `checkoutUrl` + `txRef`
8. `txRef` and `queueId` saved to `sessionStorage` (recovery if browser closes)
9. Driver redirected to Chapa checkout page
10. After payment, Chapa redirects back to `/queue/{queueId}?trx_ref={txRef}`
11. App calls `GET /api/payments/verify/{txRef}`
12. On success: queue `status` → `'active'`, `paymentStatus` → `'paid'`, `paidAmount` updated
13. Driver sees their position in the queue

**Advance payment rule:** 25% of total price is paid upfront. Remaining 75% is paid at the station.

---

### 3.5 Queue Position Tracking

```
Queue page loads → Position fetched → Socket room joined → Real-time updates
```

**Steps:**
1. Driver visits `/queue/{queueId}`
2. `GET /api/queue/position/{queueId}` returns current position, estimated wait, total in queue
3. Socket.io: client emits `join-queue-room` with `queueId`
4. When admin completes a driver ahead: server emits `queue-updated` to all drivers in the room
5. Each driver's position decrements, estimated wait recalculates
6. When `position === 1`: driver is next — notification triggered if permission granted
7. When `status === 'completed'`: driver served, redirect to dashboard

**Estimated wait calculation:** `estimatedWait = (position - 1) × avgServiceTimeMinutes` (default: 7 min per vehicle)

---

### 3.6 Cancel Queue

```
Driver taps Cancel → Confirmation → DELETE request → Queue cancelled → Refund initiated
```

**Steps:**
1. Driver taps "Cancel Queue Request" on `/queue/{queueId}`
2. Confirmation dialog shown (warns about refund policy)
3. `DELETE /api/queue/cancel/{queueId}`
4. Queue `status` → `'cancelled'`
5. If `paymentStatus === 'paid'`: refund process initiated via Chapa, `paymentStatus` → `'refunded'`
6. All other drivers in queue shift up by 1 position
7. Socket event `queue-updated` emitted to all drivers in the station room
8. Driver redirected to `/dashboard`

---

### 3.7 Admin — Live Queue Management

```
Admin logs in → Views live queue → Takes action (Complete / Skip / Remove) → Queue updates → Drivers notified
```

**Steps:**
1. Admin logs in at `/login` with `station_admin` credentials
2. Redirected to `/admin` (dashboard)
3. Navigates to `/admin/queue`
4. `GET /api/admin/queue` returns all `waiting` entries for the admin's station, sorted by position
5. Admin can filter by fuel type or search by driver name / plate number

**Actions:**

| Action | Button | Behavior |
|--------|--------|----------|
| Complete | ✅ | Driver #1 marked `completed`, all others shift up by 1, socket event emitted |
| Skip | ⏭️ | Driver moved to last position in queue, others shift up |
| Remove | ❌ | Confirmation modal → driver `cancelled`, gap closed, socket event emitted |

6. Socket.io: admin joins `station-{stationId}` room on page load
7. Incoming events: `driver-joined` (new driver added), `driver-cancelled` (driver left)
8. Outgoing events: `admin-complete-driver`, `admin-skip-driver`, `admin-remove-driver`

---

### 3.8 Admin — Fuel Inventory

```
Admin views fuel cards → Taps Edit → Updates stock/price/availability → Saved
```

**Steps:**
1. Admin visits `/admin/fuel`
2. `GET /api/admin/fuels` returns all fuel types for the station
3. Each card shows: fuel type, stock level (L), price (ETB/L), availability status
4. Status is auto-calculated from stock:
   - `> 1000L` → 🟢 Available
   - `300–1000L` → 🟡 Low Stock
   - `< 300L` → 🔴 Critical
5. Admin taps Edit → modal opens with current values
6. Admin updates stock, price, or availability toggle
7. `PATCH /api/admin/fuels/{type}` → updates station fuel record
8. UI updates immediately (optimistic update)

---

## 4. Data Inputs & Outputs per Feature

### Auth

| Operation | Input | Output |
|-----------|-------|--------|
| Register | `fullName`, `phone`, `email`, `plateNumber`, `vehicleType`, `licenseNumber`, `password` | `{ user, token }` |
| Login | `email`, `password` | `{ user, token }` |
| Verify session | `token` (from localStorage) | `User` object |
| Logout | — | Clears localStorage |

### Stations

| Operation | Input | Output |
|-----------|-------|--------|
| Get nearby | `lat`, `lng`, `radius` | `Station[]` sorted by distance |
| Get by ID | `stationId` | `Station` with fuels and queue size |

### Queue

| Operation | Input | Output |
|-----------|-------|--------|
| Join queue | `stationId`, `fuelType`, `liters`, `totalPrice`, `advancePayment` | `Queue` (id, position, estimatedWait) |
| Get position | `queueId` | `Queue` (position, estimatedWait, status) |
| Cancel | `queueId` | `{ success: true }` |
| Get active | — (uses auth token) | `Queue \| null` |
| Get history | — (uses auth token) | `Queue[]` |

### Payments

| Operation | Input | Output |
|-----------|-------|--------|
| Initialize | `stationId`, `queueId`, `fuelType`, `liters`, `amount` | `{ checkoutUrl, txRef, advanceAmount, totalAmount }` |
| Verify | `txRef` | `{ verified, success, queueId, status, amount, method }` |

### Admin Queue

| Operation | Input | Output |
|-----------|-------|--------|
| Get queue | — (station from auth) | `QueueEntry[]` |
| Complete driver | `queueId` | `{ success: true }` |
| Skip driver | `queueId` | `{ success: true }` |
| Remove driver | `queueId` | `{ success: true }` |
| Get stats | — | `{ totalInQueue, completedToday, totalFuelRemaining }` |

### Admin Fuel

| Operation | Input | Output |
|-----------|-------|--------|
| Get fuels | — (station from auth) | `AdminFuel[]` |
| Update fuel | `type`, `stockLiters`, `pricePerLiter`, `available` | `{ success: true }` |

---

## 5. Database Schema

### `users`

```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name       VARCHAR(100)  NOT NULL,
  email           VARCHAR(255)  NOT NULL UNIQUE,
  phone           VARCHAR(20)   NOT NULL,
  password_hash   VARCHAR(255)  NOT NULL,
  role            user_role     NOT NULL DEFAULT 'driver',
  station_id      UUID          REFERENCES stations(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Drivers only
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID          NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  plate_number    VARCHAR(20)   NOT NULL,
  vehicle_type    vehicle_type  NOT NULL,
  license_number  VARCHAR(50)   NOT NULL,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### `stations`

```sql
CREATE TABLE stations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(150)  NOT NULL,
  address         TEXT          NOT NULL,
  lat             DECIMAL(10,7) NOT NULL,
  lng             DECIMAL(10,7) NOT NULL,
  working_hours   VARCHAR(100),
  image_url       TEXT,
  is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

---

### `station_fuels`

One row per fuel type per station. Updated by admin when stock changes.

```sql
CREATE TABLE station_fuels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id      UUID          NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  fuel_type       fuel_type     NOT NULL,
  available       BOOLEAN       NOT NULL DEFAULT TRUE,
  stock_liters    DECIMAL(10,2) NOT NULL DEFAULT 0,
  price_per_liter DECIMAL(8,2)  NOT NULL,
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE (station_id, fuel_type)
);
```

---

### `queues`

Central table. One row per queue request.

```sql
CREATE TABLE queues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  station_id      UUID          NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  fuel_type       fuel_type     NOT NULL,
  liters          DECIMAL(8,2)  NOT NULL,
  total_price     DECIMAL(10,2) NOT NULL,
  advance_payment DECIMAL(10,2) NOT NULL,   -- 25% of total_price
  paid_amount     DECIMAL(10,2) NOT NULL DEFAULT 0,
  position        INTEGER       NOT NULL,   -- 1-based, recalculated on changes
  estimated_wait  INTEGER       NOT NULL DEFAULT 0,  -- minutes
  status          queue_status  NOT NULL DEFAULT 'pending',
  payment_status  payment_status NOT NULL DEFAULT 'pending',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Index for fast position lookups per station
CREATE INDEX idx_queues_station_status ON queues(station_id, status);
CREATE INDEX idx_queues_driver ON queues(driver_id);
```

---

### `payments`

One row per Chapa transaction attempt.

```sql
CREATE TABLE payments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id        UUID          NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tx_ref          VARCHAR(100)  NOT NULL UNIQUE,  -- Chapa transaction reference
  chapa_ref       VARCHAR(100),                   -- Chapa's internal reference
  amount          DECIMAL(10,2) NOT NULL,
  currency        CHAR(3)       NOT NULL DEFAULT 'ETB',
  status          payment_status NOT NULL DEFAULT 'pending',
  method          VARCHAR(50),                    -- e.g. 'telebirr', 'cbe_birr'
  initiated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  verified_at     TIMESTAMPTZ,
  refunded_at     TIMESTAMPTZ
);

CREATE INDEX idx_payments_tx_ref ON payments(tx_ref);
CREATE INDEX idx_payments_queue ON payments(queue_id);
```

---

### `queue_history`

Audit log — written when a queue entry changes status. Enables the driver history page and admin stats.

```sql
CREATE TABLE queue_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id        UUID          NOT NULL REFERENCES queues(id) ON DELETE CASCADE,
  station_id      UUID          NOT NULL REFERENCES stations(id),
  driver_id       UUID          NOT NULL REFERENCES users(id),
  action          history_action NOT NULL,   -- 'joined', 'completed', 'cancelled', 'skipped'
  performed_by    UUID          REFERENCES users(id),  -- NULL = system, admin id = admin action
  note            TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_queue_history_driver ON queue_history(driver_id);
CREATE INDEX idx_queue_history_station ON queue_history(station_id, created_at);
```

---

## 6. Entity Relationships

```
users ──────────────────────────────────────────────────────────────────┐
  │ (role=driver)                                                        │
  │ 1:1                                                                  │
  ▼                                                                      │
vehicles                                                                 │
                                                                         │
users ──────────────────────────────────────────────────────────────────┤
  │ (role=station_admin, station_id FK)                                  │
  │ N:1                                                                  │
  ▼                                                                      │
stations ──────────────────────────────────────────────────────────────┐│
  │ 1:N                                                                 ││
  ▼                                                                     ││
station_fuels                                                           ││
                                                                        ││
stations ──────────────────────────────────────────────────────────────┤│
  │ 1:N                                                                 ││
  ▼                                                                     ││
queues ◄────────────────────────────────────────────────────────────────┘│
  │ 1:N                                                                   │
  ▼                                                                       │
payments                                                                  │
                                                                          │
queues ────────────────────────────────────────────────────────────────── │
  │ 1:N                                                                    │
  ▼                                                                        │
queue_history ◄─────────────────────────────────────────────────────────┘
```

**Summary:**
- A `user` with `role=driver` has one `vehicle`
- A `user` with `role=station_admin` belongs to one `station`
- A `station` has many `station_fuels` (one per fuel type)
- A `station` has many `queues`
- A `queue` belongs to one `driver` (user) and one `station`
- A `queue` has many `payments` (retry attempts)
- Every status change on a `queue` writes a row to `queue_history`

---

## 7. Enum Reference

```sql
CREATE TYPE user_role AS ENUM ('driver', 'station_admin');

CREATE TYPE vehicle_type AS ENUM ('sedan', 'suv', 'truck', 'motorcycle', 'van');

CREATE TYPE fuel_type AS ENUM ('Benzene', 'Diesel', 'Kerosene');

CREATE TYPE queue_status AS ENUM (
  'pending',    -- created, payment not yet confirmed
  'active',     -- payment confirmed, waiting in queue
  'serving',    -- currently being served at the pump
  'completed',  -- fuel dispensed, driver left
  'cancelled'   -- driver or admin cancelled
);

CREATE TYPE payment_status AS ENUM (
  'pending',    -- Chapa checkout initiated, not yet paid
  'paid',       -- Chapa verified payment success
  'failed',     -- Chapa reported failure
  'refunded'    -- advance payment returned to driver
);

CREATE TYPE history_action AS ENUM (
  'joined',     -- driver joined the queue
  'completed',  -- admin marked as served
  'cancelled',  -- driver or admin cancelled
  'skipped',    -- admin moved driver to end of queue
  'position_updated'  -- position changed due to another driver's action
);
```

---

## 8. API Endpoint Map

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | Public | Register new driver |
| `POST` | `/api/auth/login` | Public | Login (any role) |
| `POST` | `/api/auth/logout` | Bearer | Invalidate session |
| `GET`  | `/api/auth/me` | Bearer | Get current user |
| `GET`  | `/api/stations/nearby` | Public | Stations near coordinates |
| `GET`  | `/api/stations/:id` | Public | Single station detail |
| `POST` | `/api/queue/join` | Bearer (driver) | Join a station queue |
| `GET`  | `/api/queue/position/:queueId` | Bearer (driver) | Get queue position |
| `DELETE` | `/api/queue/cancel/:queueId` | Bearer (driver) | Cancel queue entry |
| `GET`  | `/api/driver/active-queue` | Bearer (driver) | Get driver's active queue |
| `GET`  | `/api/driver/history` | Bearer (driver) | Get driver's queue history |
| `POST` | `/api/payments/initialize` | Bearer (driver) | Start Chapa payment |
| `GET`  | `/api/payments/verify/:txRef` | Bearer (driver) | Verify Chapa payment |
| `GET`  | `/api/admin/queue` | Bearer (station_admin) | Get station's live queue |
| `PATCH` | `/api/admin/queue/:id/complete` | Bearer (station_admin) | Mark driver as served |
| `PATCH` | `/api/admin/queue/:id/skip` | Bearer (station_admin) | Move driver to end |
| `DELETE` | `/api/admin/queue/:id` | Bearer (station_admin) | Remove driver from queue |
| `GET`  | `/api/admin/fuels` | Bearer (station_admin) | Get station fuel inventory |
| `PATCH` | `/api/admin/fuels/:type` | Bearer (station_admin) | Update fuel stock/price |
| `GET`  | `/api/admin/stats` | Bearer (station_admin) | Get today's station stats |

---

*All mock service functions in `services/` are structured to match these endpoints exactly — swapping mock implementations for real `axios` calls is a one-line change per function.*
