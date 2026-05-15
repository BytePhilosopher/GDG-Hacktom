# ⛽ FuelQ — Smart Gas Station Queue Management

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![Chapa](https://img.shields.io/badge/Chapa-Payment-green)](https://chapa.co/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> A digital queue management system for fuel stations in Ethiopia — eliminating hours of physical waiting through smart scheduling and integrated Chapa payments.

---

## 🚨 The Problem

Fuel shortages and long queues at gas stations are a daily reality across Ethiopia. Drivers routinely spend **3–6 hours** waiting in physical lines, often:

- Leaving their vehicles unattended for hours
- Missing work, school, or critical appointments
- Wasting fuel idling in queue
- Having no visibility into wait times or fuel availability
- Driving to multiple stations only to find them empty

This is not just an inconvenience — it is a measurable drag on productivity and the economy. In Addis Ababa alone, hundreds of thousands of vehicle-hours are lost every week to fuel queues.

---

## 💡 The Solution

**FuelQ** replaces the physical queue with a digital one. Drivers find nearby stations, check real-time fuel availability, join a queue remotely, and pay a 25% advance through **Chapa** — all from their phone. They only need to show up when it's their turn.

### Key capabilities

- 📍 **Location-aware station discovery** — find the nearest open stations with available fuel
- 🔢 **Digital queue with live position tracking** — know exactly where you stand
- 💳 **Chapa-integrated advance payment** — secure your spot with 25% upfront
- 🔔 **Real-time updates via WebSocket** — get notified when your turn approaches
- 🏪 **Station admin dashboard** — manage queues, update fuel inventory, mark completions
- 📊 **Queue analytics** — throughput, revenue, and wait-time stats for operators

---

## 🌍 Impact

| Metric | Estimate |
|---|---|
| Average wait time saved per driver | 2–4 hours per visit |
| Fuel saved (no idling in queue) | ~0.5–1L per visit |
| Economic value per driver per visit | 200–500 ETB in recovered time |
| Stations manageable per deployment | Unlimited (multi-tenant) |
| Scalability | City-wide → National |

By digitizing the queue, FuelQ enables station operators to serve more drivers per day with less chaos, while drivers reclaim their time. At scale, this reduces urban congestion, lowers emissions from idling vehicles, and improves the daily lives of millions of Ethiopians.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 15 (App Router) | Full-stack React framework |
| Language | TypeScript 5 | Type safety across frontend and backend |
| Database | PostgreSQL | Primary relational data store |
| ORM | Prisma | Type-safe database access and migrations |
| Auth | JWT (HTTP-only cookies) | Stateless session management |
| Payments | Chapa API | Ethiopian payment gateway |
| Real-time | Socket.IO / WebSocket | Live queue position updates |
| Maps | Google Maps API | Station discovery and geolocation |
| Styling | Tailwind CSS + shadcn/ui | UI components and design system |
| Deployment | Vercel + Supabase/Neon | Serverless hosting + managed Postgres |


---

## 🔄 User Flow

### Driver Flow

```
1. Open FuelQ app
        │
        ▼
2. Register / Login (email + password)
        │
        ▼
3. Allow location access
        │
        ▼
4. Browse nearby stations on map
   → See fuel types, prices, availability, queue size, distance
        │
        ▼
5. Select a station → View station detail page
   → Fuel types: Benzene | Diesel | Kerosene
   → Price per liter, remaining quantity, current queue length
        │
        ▼
6. Choose fuel type + enter desired liters
   → System calculates: totalPrice = liters × pricePerLiter
   → Advance payment = 25% of totalPrice
        │
        ▼
7. Click "Join Queue"
   → POST /api/queue/join
   → Receive: queueId, position, estimatedWait
        │
        ▼
8. Click "Pay Advance" (25%)
   → POST /api/payments/initialize
   → Receive: checkoutUrl (Chapa), txRef
        │
        ▼
9. Redirect to Chapa checkout
   → Complete payment (test: 0911234567 / PIN 1234)
        │
        ▼
10. Chapa redirects to /payment/success?trx_ref=...&queueId=...
    → GET /api/payments/verify/{txRef}
    → Queue status → active
        │
        ▼
11. Driver sees live queue position
    → WebSocket pushes updates as queue moves
    → Estimated wait = position × 7 minutes
        │
        ▼
12. Driver arrives at station when notified
    → Station admin marks queue entry as completed
        │
        ▼
13. Transaction complete ✅
    → Appears in driver history: GET /api/driver/history
```

### Station Admin Flow

```
1. Login with station_admin role
        │
        ▼
2. Admin dashboard → /admin
   → View live queue, stats, fuel inventory
        │
        ▼
3. Manage fuel inventory → /admin/fuel
   → Update availability, remaining quantity, price per liter
        │
        ▼
4. Manage queue → /admin/queue
   → See all active queue entries with driver info
   → Mark as completed → POST /api/admin/queue/[id]/complete
   → Skip a driver  → POST /api/admin/queue/[id]/skip
        │
        ▼
5. View station stats → GET /api/admin/stats
   → Total served today, revenue, average wait time
```


---

## 📡 API Reference

All routes are prefixed with `/api`. Protected routes require a valid JWT in an HTTP-only cookie (`token`).

### Authentication

#### `POST /api/auth/register`
Register a new user account.

**Auth:** None

**Request body:**
```json
{
  "fullName": "Abebe Kebede",
  "email": "abebe@example.com",
  "phone": "0911234567",
  "password": "securepassword",
  "role": "driver",
  "vehicleInfo": {
    "plateNumber": "AA-12345",
    "vehicleType": "sedan",
    "licenseNumber": "ETH-LIC-001"
  }
}
```

**Response `201`:**
```json
{
  "user": {
    "id": "clx...",
    "fullName": "Abebe Kebede",
    "email": "abebe@example.com",
    "phone": "0911234567",
    "role": "driver"
  }
}
```

---

#### `POST /api/auth/login`
Authenticate and receive a session cookie.

**Auth:** None

**Request body:**
```json
{
  "email": "abebe@example.com",
  "password": "securepassword"
}
```

**Response `200`:** Sets `token` HTTP-only cookie. Returns user object.

---

#### `GET /api/auth/me`
Get the currently authenticated user.

**Auth:** Required

**Response `200`:**
```json
{
  "id": "clx...",
  "fullName": "Abebe Kebede",
  "email": "abebe@example.com",
  "role": "driver",
  "vehicleInfo": {
    "plateNumber": "AA-12345",
    "vehicleType": "sedan",
    "licenseNumber": "ETH-LIC-001"
  }
}
```

---

#### `POST /api/auth/logout`
Clear the session cookie.

**Auth:** Required

**Response `200`:** `{ "message": "Logged out" }`

---

### Stations

#### `GET /api/stations/nearby?lat={lat}&lng={lng}&radius={km}`
Find stations within a given radius, sorted by distance.

**Auth:** None

**Query params:**
| Param | Type | Required | Description |
|---|---|---|---|
| `lat` | number | ✅ | Driver latitude |
| `lng` | number | ✅ | Driver longitude |
| `radius` | number | ❌ | Search radius in km (default: 10) |

**Response `200`:**
```json
[
  {
    "id": "station-1",
    "name": "Total Bole",
    "location": { "lat": 9.0105, "lng": 38.7636, "address": "Bole, Addis Ababa" },
    "fuels": [
      { "type": "Benzene", "available": true, "pricePerLiter": 52.66, "remainingQuantity": 5000 },
      { "type": "Diesel",  "available": true, "pricePerLiter": 49.50, "remainingQuantity": 3000 }
    ],
    "queueSize": 4,
    "distance": 1.2
  }
]
```

---

#### `GET /api/stations/[id]`
Get full details for a single station.

**Auth:** None

**Response `200`:** Full station object including fuels, working hours, image URL.

---

### Queue

#### `POST /api/queue/join`
Join the queue at a station for a specific fuel type.

**Auth:** Required (driver)

**Request body:**
```json
{
  "stationId": "station-1",
  "fuelType": "Benzene",
  "liters": 30
}
```

**Response `201`:**
```json
{
  "queueId": "clx...",
  "position": 3,
  "estimatedWait": 21,
  "totalPrice": 1579.80,
  "advancePayment": 394.95
}
```

> **Business rule:** A driver may only have one active queue entry at a time. Attempting to join a second queue returns `409 Conflict`.

---

#### `GET /api/queue/position/[queueId]`
Poll the current position and status of a queue entry.

**Auth:** Required

**Response `200`:**
```json
{
  "position": 2,
  "estimatedWait": 14,
  "status": "active",
  "paymentStatus": "paid"
}
```

---

#### `DELETE /api/queue/cancel/[queueId]`
Cancel a queue entry. Triggers refund flow if payment was made.

**Auth:** Required (owner of queue entry)

**Response `200`:** `{ "message": "Queue entry cancelled" }`

---

### Driver

#### `GET /api/driver/active-queue`
Get the driver's current active queue entry, if any.

**Auth:** Required (driver)

**Response `200`:** Queue object or `null`.

---

#### `GET /api/driver/history`
Get the driver's completed and cancelled queue history.

**Auth:** Required (driver)

**Response `200`:** Array of queue objects with payment details.

---

### Payments

#### `POST /api/payments/initialize`
Initialize a Chapa payment for a queue entry.

**Auth:** Required (driver)

**Request body:**
```json
{
  "stationId": "station-1",
  "queueId": "clx...",
  "fuelType": "Benzene",
  "liters": 30,
  "amount": 394.95
}
```

**Response `200`:**
```json
{
  "checkoutUrl": "https://checkout.chapa.co/checkout/payment/...",
  "txRef": "fuelq-clx...-1718000000000"
}
```

---

#### `GET /api/payments/verify/[txRef]`
Verify a payment after Chapa redirect. Updates queue status to `active` on success.

**Auth:** Required

**Response `200`:**
```json
{
  "status": "success",
  "queueId": "clx...",
  "amount": 394.95,
  "chapaRef": "CHAPA-REF-..."
}
```

---

#### `POST /api/payments/webhook`
Chapa webhook endpoint. Verifies HMAC signature and processes payment events idempotently.

**Auth:** HMAC signature via `x-chapa-signature` header (not JWT)

**Request body:** Chapa webhook payload

**Response `200`:** `{ "received": true }`

> Duplicate webhook events are safely ignored — the handler checks existing payment status before applying any state change.

---

### Admin Routes

All admin routes require `role: station_admin` and the user must be associated with the station.

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/admin/queue` | List all active queue entries for the station |
| `GET` | `/api/admin/queue/[id]` | Get a single queue entry detail |
| `POST` | `/api/admin/queue/[id]/complete` | Mark a queue entry as completed |
| `POST` | `/api/admin/queue/[id]/skip` | Skip a driver (moves them to end of queue) |
| `GET` | `/api/admin/fuels` | Get fuel inventory for the station |
| `PATCH` | `/api/admin/fuels/[fuelType]` | Update fuel availability, quantity, or price |
| `GET` | `/api/admin/stats` | Get station statistics (served today, revenue, avg wait) |


---

## 🗄 Database Schema

Full Prisma schema for production. Run `npx prisma migrate deploy` to apply.

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum Role {
  driver
  station_admin
}

enum VehicleType {
  sedan
  suv
  truck
  motorcycle
  van
}

enum FuelType {
  Benzene
  Diesel
  Kerosene
}

enum QueueStatus {
  pending    // joined, payment not yet completed
  active     // payment confirmed, waiting at station
  completed  // served by station
  cancelled  // cancelled by driver or expired
}

enum PaymentStatus {
  pending
  paid
  failed
  refunded
}

enum ChapaPaymentStatus {
  pending
  success
  failed
  refunded
}

// ─────────────────────────────────────────
// USERS
// ─────────────────────────────────────────

model User {
  id          String   @id @default(cuid())
  fullName    String
  email       String   @unique
  phone       String   @unique
  password    String   // bcrypt hash
  role        Role     @default(driver)

  // For station_admin: which station they manage
  stationId   String?
  station     Station? @relation("StationAdmin", fields: [stationId], references: [id])

  // Vehicle info (drivers only)
  plateNumber   String?
  vehicleType   VehicleType?
  licenseNumber String?

  queues      Queue[]
  payments    Payment[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([email])
  @@index([phone])
  @@index([stationId])
}

// ─────────────────────────────────────────
// STATIONS
// ─────────────────────────────────────────

model Station {
  id           String   @id @default(cuid())
  name         String
  address      String
  lat          Float
  lng          Float
  workingHours String   // e.g. "06:00–22:00"
  imageUrl     String?
  isActive     Boolean  @default(true)

  fuels        Fuel[]
  queues       Queue[]
  admins       User[]   @relation("StationAdmin")

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([lat, lng])
}

// ─────────────────────────────────────────
// FUELS
// ─────────────────────────────────────────

model Fuel {
  id                String   @id @default(cuid())
  stationId         String
  station           Station  @relation(fields: [stationId], references: [id], onDelete: Cascade)

  type              FuelType
  available         Boolean  @default(true)
  remainingQuantity Float    @default(0)   // in liters
  pricePerLiter     Float

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([stationId, type])
  @@index([stationId])
  @@index([type, available])
}

// ─────────────────────────────────────────
// QUEUES
// ─────────────────────────────────────────

model Queue {
  id              String        @id @default(cuid())
  driverId        String
  driver          User          @relation(fields: [driverId], references: [id])

  stationId       String
  station         Station       @relation(fields: [stationId], references: [id])
  stationName     String        // denormalized for history display

  fuelType        FuelType
  liters          Float
  totalPrice      Float         // liters × pricePerLiter
  advancePayment  Float         // 25% of totalPrice
  paidAmount      Float         @default(0)

  position        Int           // position in queue at time of joining
  estimatedWait   Int           // minutes = position × 7

  status          QueueStatus   @default(pending)
  paymentStatus   PaymentStatus @default(pending)

  payment         Payment?

  expiresAt       DateTime?     // set to now+15min on creation; null after payment
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@index([driverId, status])
  @@index([stationId, status])
  @@index([createdAt])
}

// ─────────────────────────────────────────
// PAYMENTS
// ─────────────────────────────────────────

model Payment {
  id          String             @id @default(cuid())
  queueId     String             @unique
  queue       Queue              @relation(fields: [queueId], references: [id])

  userId      String
  user        User               @relation(fields: [userId], references: [id])

  txRef       String             @unique  // fuelq-{cuid}-{timestamp}
  amount      Float
  currency    String             @default("ETB")

  status      ChapaPaymentStatus @default(pending)
  chapaRef    String?            // Chapa's internal reference
  method      String?            // e.g. "telebirr", "cbe"

  initiatedAt DateTime           @default(now())
  verifiedAt  DateTime?
  refundedAt  DateTime?

  @@index([txRef])
  @@index([userId])
  @@index([status])
}
```

### Seeded Stations (Addis Ababa)

The following stations are pre-seeded via `prisma/seed.ts` for development and demo:

| ID | Name | Coordinates | Fuels |
|---|---|---|---|
| `station-1` | Total Bole | 9.0105, 38.7636 | Benzene 52.66 ETB/L, Diesel 49.50 ETB/L |
| `station-2` | NOC Kazanchis | 9.0227, 38.7614 | Benzene 52.66, Kerosene 38.00 (Diesel unavailable) |
| `station-3` | Oilibya Megenagna | 9.0348, 38.7714 | Benzene 52.66, Diesel 49.50 |
| `station-4` | Total Piassa | 9.0348, 38.7469 | Diesel 49.50, Kerosene 38.00 (Benzene unavailable) |
| `station-5` | Kobil CMC | 9.0456, 38.8012 | Benzene 52.66, Diesel 49.50 |


---

## 🔐 Environment Variables

Create a `.env.local` file in the project root. Never commit this file.

```env
# ── App ──────────────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ── Database ─────────────────────────────────────────────────────────
DATABASE_URL=postgresql://user:password@localhost:5432/fuelq

# ── Authentication ───────────────────────────────────────────────────
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d

# ── Chapa Payment Gateway ────────────────────────────────────────────
# Get keys from https://dashboard.chapa.co
NEXT_PUBLIC_CHAPA_PUBLIC_KEY=CHAPUBK-...
CHAPA_SECRET_KEY=CHASECK-...
CHAPA_WEBHOOK_SECRET=your-webhook-secret

# ── Google Maps ──────────────────────────────────────────────────────
# Enable Maps JavaScript API + Geocoding API in Google Cloud Console
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIza...

# ── WebSocket ────────────────────────────────────────────────────────
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | Base URL of the app (used for Chapa callback URLs) |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret for signing JWT tokens (min 32 chars) |
| `JWT_EXPIRES_IN` | ✅ | Token expiry duration (e.g. `7d`, `24h`) |
| `NEXT_PUBLIC_CHAPA_PUBLIC_KEY` | ✅ | Chapa public key (safe to expose to browser) |
| `CHAPA_SECRET_KEY` | ✅ | Chapa secret key (server-side only) |
| `CHAPA_WEBHOOK_SECRET` | ✅ | Used to verify HMAC signature on webhook events |
| `NEXT_PUBLIC_GOOGLE_MAPS_KEY` | ✅ | Google Maps API key for map rendering |
| `NEXT_PUBLIC_SOCKET_URL` | ✅ | WebSocket server URL for real-time updates |

---

## 🚀 Local Development Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or a free cloud instance via [Neon](https://neon.tech) or [Supabase](https://supabase.com))
- A [Chapa](https://chapa.co) test account

### 1. Clone the repository

```bash
git clone https://github.com/your-org/smart-gas-queue.git
cd smart-gas-queue
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

### 4. Set up the database

```bash
# Run migrations
npx prisma migrate dev --name init

# Seed with Addis Ababa stations and demo users
npx prisma db seed
```

### 5. Start the development server

```bash
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

### 6. (Optional) Open Prisma Studio

```bash
npx prisma studio
```

### Demo credentials

After seeding, the following accounts are available:

| Role | Email | Password |
|---|---|---|
| Driver | `driver@fuelq.et` | `password123` |
| Station Admin | `admin@totalBole.et` | `password123` |

### Chapa test payment

When redirected to Chapa checkout in test mode:
- **Phone:** `0911234567`
- **PIN:** `1234`


---

## 📁 Project Structure

```
smart-gas-queue/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Landing / home page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── stations/
│   │   └── [id]/
│   │       ├── page.tsx          # Station detail
│   │       └── queue/page.tsx    # Join queue flow
│   ├── payment/
│   │   └── success/page.tsx      # Post-Chapa redirect handler
│   ├── driver/
│   │   ├── dashboard/page.tsx    # Active queue + map
│   │   └── history/page.tsx      # Past queue entries
│   ├── admin/
│   │   ├── layout.tsx            # Admin shell layout
│   │   ├── page.tsx              # Admin dashboard
│   │   ├── queue/page.tsx        # Live queue management
│   │   └── fuel/page.tsx         # Fuel inventory management
│   └── api/                      # API Route Handlers
│       ├── auth/
│       │   ├── register/route.ts
│       │   ├── login/route.ts
│       │   ├── me/route.ts
│       │   └── logout/route.ts
│       ├── stations/
│       │   ├── nearby/route.ts
│       │   └── [id]/route.ts
│       ├── queue/
│       │   ├── join/route.ts
│       │   ├── position/[queueId]/route.ts
│       │   └── cancel/[queueId]/route.ts
│       ├── driver/
│       │   ├── active-queue/route.ts
│       │   └── history/route.ts
│       ├── payments/
│       │   ├── initialize/route.ts
│       │   ├── verify/[txRef]/route.ts
│       │   └── webhook/route.ts
│       └── admin/
│           ├── queue/
│           │   ├── route.ts
│           │   └── [id]/
│           │       ├── route.ts
│           │       ├── complete/route.ts
│           │       └── skip/route.ts
│           ├── fuels/
│           │   ├── route.ts
│           │   └── [fuelType]/route.ts
│           └── stats/route.ts
│
├── components/                   # Shared React components
│   ├── map/
│   │   └── MapContainer.tsx      # Google Maps wrapper
│   ├── queue/
│   │   ├── QueueCard.tsx
│   │   └── QueuePositionBadge.tsx
│   ├── station/
│   │   ├── StationCard.tsx
│   │   └── FuelBadge.tsx
│   └── ui/                       # shadcn/ui components
│
├── lib/                          # Shared utilities
│   ├── prisma.ts                 # Prisma client singleton
│   ├── auth.ts                   # JWT sign/verify helpers
│   ├── api-error.ts              # Typed API error class
│   ├── chapa.ts                  # Chapa API client
│   └── distance.ts               # Haversine distance calculation
│
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Migration history
│   └── seed.ts                   # Seed script (stations + demo users)
│
├── types/
│   └── index.ts                  # Shared TypeScript types
│
├── .env.local                    # Local environment variables (gitignored)
├── .env.example                  # Environment variable template
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```


---

## 💳 Payment Flow Diagram

```
Driver App                    FuelQ Backend                  Chapa API
    │                               │                              │
    │── POST /queue/join ──────────▶│                              │
    │◀─ { queueId, position } ──────│                              │
    │                               │                              │
    │── POST /payments/initialize ─▶│                              │
    │                               │── POST /v1/transaction/initialize ──▶│
    │                               │◀─ { checkout_url, tx_ref } ──────────│
    │◀─ { checkoutUrl, txRef } ─────│                              │
    │                               │                              │
    │── redirect to checkoutUrl ───────────────────────────────────▶│
    │                               │                              │
    │   [Driver completes payment on Chapa]                        │
    │                               │                              │
    │◀─ redirect to /payment/success?trx_ref=...&queueId=... ──────│
    │                               │                              │
    │── GET /payments/verify/{txRef}▶│                              │
    │                               │── GET /v1/transaction/verify ───────▶│
    │                               │◀─ { status: "success", ... } ────────│
    │                               │                              │
    │                               │  UPDATE queue.status = active│
    │                               │  UPDATE payment.status = success
    │                               │                              │
    │◀─ { status: "success" } ──────│                              │
    │                               │                              │
    │   [Chapa also sends webhook]  │                              │
    │                               │◀── POST /payments/webhook ───│
    │                               │    (HMAC verified)           │
    │                               │    (idempotent — no-op if    │
    │                               │     already verified)        │
    │                               │──▶ 200 { received: true }    │
```

### Business Rules

| Rule | Value |
|---|---|
| Advance payment | 25% of `liters × pricePerLiter` |
| Estimated wait time | `position × 7 minutes` |
| Max active queues per driver | 1 |
| Queue expiry (unpaid) | 15 minutes (production) |
| Webhook deduplication | Idempotent — duplicate events ignored |
| Currency | ETB (Ethiopian Birr) |

---

## 🔌 WebSocket Events

The WebSocket server (Socket.IO) enables real-time queue updates without polling.

### Connection

```typescript
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
  auth: { token: "your-jwt-token" }
});
```

### Events — Client → Server

| Event | Payload | Description |
|---|---|---|
| `queue:subscribe` | `{ queueId: string }` | Subscribe to updates for a specific queue entry |
| `queue:unsubscribe` | `{ queueId: string }` | Unsubscribe from a queue entry |
| `station:subscribe` | `{ stationId: string }` | Subscribe to station-wide queue updates (admin) |

### Events — Server → Client

| Event | Payload | Description |
|---|---|---|
| `queue:position_update` | `{ queueId, position, estimatedWait }` | Fired when the driver's position changes |
| `queue:status_change` | `{ queueId, status, paymentStatus }` | Fired on any status transition |
| `queue:your_turn` | `{ queueId, stationName }` | Fired when driver reaches position 1 |
| `station:queue_update` | `{ stationId, activeCount }` | Fired when station queue size changes (admin) |
| `error` | `{ message: string }` | Authentication or subscription error |

### Example — Driver listening for position updates

```typescript
socket.emit("queue:subscribe", { queueId });

socket.on("queue:position_update", ({ position, estimatedWait }) => {
  console.log(`Position: ${position}, ~${estimatedWait} min wait`);
});

socket.on("queue:your_turn", () => {
  showNotification("It's your turn! Head to the station now.");
});
```


---

## 🚢 Production Deployment

### Recommended stack

| Service | Provider | Notes |
|---|---|---|
| App hosting | [Vercel](https://vercel.com) | Zero-config Next.js deployment |
| Database | [Neon](https://neon.tech) or [Supabase](https://supabase.com) | Managed PostgreSQL with connection pooling |
| WebSocket server | [Railway](https://railway.app) or [Render](https://render.com) | Persistent Node.js process for Socket.IO |
| File storage | [Cloudinary](https://cloudinary.com) | Station images |

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all environment variables in the Vercel dashboard under **Settings → Environment Variables**.

### Database migration in production

```bash
# Run migrations against production DB (never use migrate dev in prod)
npx prisma migrate deploy
```

### Chapa webhook configuration

1. Log in to [Chapa Dashboard](https://dashboard.chapa.co)
2. Navigate to **Settings → Webhooks**
3. Add your webhook URL: `https://your-domain.com/api/payments/webhook`
4. Copy the webhook secret and set it as `CHAPA_WEBHOOK_SECRET`

The webhook handler verifies the `x-chapa-signature` HMAC header on every request. Requests with invalid signatures are rejected with `401`.

### Queue expiry cron job

In production, unpaid queue entries should be expired after 15 minutes. Set up a cron job (Vercel Cron, GitHub Actions, or a scheduled Railway job) to call a cleanup endpoint:

```bash
# Example: run every 5 minutes
*/5 * * * * curl -X POST https://your-domain.com/api/cron/expire-queues \
  -H "Authorization: Bearer $CRON_SECRET"
```

### Security checklist

- [ ] `JWT_SECRET` is at least 32 random characters
- [ ] `CHAPA_SECRET_KEY` is never exposed to the browser (no `NEXT_PUBLIC_` prefix)
- [ ] `CHAPA_WEBHOOK_SECRET` is set and HMAC verification is enabled
- [ ] Database connection uses SSL (`?sslmode=require` in `DATABASE_URL`)
- [ ] Rate limiting is applied to `/api/auth/login` and `/api/payments/initialize`
- [ ] CORS is restricted to your app domain
- [ ] HTTP-only, Secure, SameSite=Strict cookies for JWT

---

## 📄 License

MIT © 2024 FuelQ Team — Built at GDG Hackathon, Addis Ababa
