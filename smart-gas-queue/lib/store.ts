/**
 * In-memory data store — uses Node's `global` object so the Maps survive
 * across Next.js hot-reloads and route-worker boundaries in dev mode.
 *
 * Replace with Prisma + PostgreSQL for production.
 */

import { Station, Queue, Payment, User } from '@/types';

type StoredUser = User & { passwordHash: string };

// ── Singleton pattern via global ──────────────────────────────────────────────
declare global {
   
  var __fuelq_users:    Map<string, StoredUser>  | undefined;
   
  var __fuelq_queues:   Map<string, Queue>       | undefined;
   
  var __fuelq_payments: Map<string, Payment>     | undefined;
   
  var __fuelq_stations: Map<string, Station>     | undefined;
}

// ── Users ─────────────────────────────────────────────────────────────────────
if (!global.__fuelq_users) global.__fuelq_users = new Map<string, StoredUser>();
export const users: Map<string, StoredUser> = global.__fuelq_users;

// ── Queues ────────────────────────────────────────────────────────────────────
if (!global.__fuelq_queues) global.__fuelq_queues = new Map<string, Queue>();
export const queues: Map<string, Queue> = global.__fuelq_queues;

// ── Payments ──────────────────────────────────────────────────────────────────
if (!global.__fuelq_payments) global.__fuelq_payments = new Map<string, Payment>();
export const payments: Map<string, Payment> = global.__fuelq_payments;

// ── Stations (seeded once) ────────────────────────────────────────────────────
if (!global.__fuelq_stations) {
  global.__fuelq_stations = new Map<string, Station>([
    ['station-1', {
      id: 'station-1', name: 'Total Bole',
      location: { lat: 9.0105, lng: 38.7636, address: 'Bole, Addis Ababa' },
      workingHours: 'Open 24/7',
      imageUrl: 'https://images.unsplash.com/photo-1545262810-a9b8f4c5f5e5?w=800',
      fuels: [
        { type: 'Benzene', available: true,  remainingQuantity: 3000, pricePerLiter: 52.66 },
        { type: 'Diesel',  available: true,  remainingQuantity: 2500, pricePerLiter: 49.50 },
      ],
      queueSize: 5, distance: 0,
    }],
    ['station-2', {
      id: 'station-2', name: 'NOC Kazanchis',
      location: { lat: 9.0227, lng: 38.7614, address: 'Kazanchis, Addis Ababa' },
      workingHours: 'Mon–Sat 6am–10pm',
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
      fuels: [
        { type: 'Benzene',  available: true,  remainingQuantity: 1500, pricePerLiter: 52.66 },
        { type: 'Diesel',   available: false, remainingQuantity: 0,    pricePerLiter: 49.50 },
        { type: 'Kerosene', available: true,  remainingQuantity: 800,  pricePerLiter: 38.00 },
      ],
      queueSize: 12, distance: 0,
    }],
    ['station-3', {
      id: 'station-3', name: 'Oilibya Megenagna',
      location: { lat: 9.0348, lng: 38.7714, address: 'Megenagna, Addis Ababa' },
      workingHours: 'Open 24/7',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      fuels: [
        { type: 'Benzene', available: true, remainingQuantity: 4000, pricePerLiter: 52.66 },
        { type: 'Diesel',  available: true, remainingQuantity: 3500, pricePerLiter: 49.50 },
      ],
      queueSize: 3, distance: 0,
    }],
    ['station-4', {
      id: 'station-4', name: 'Total Piassa',
      location: { lat: 9.0348, lng: 38.7469, address: 'Piassa, Addis Ababa' },
      workingHours: 'Open 5am–11pm',
      imageUrl: 'https://images.unsplash.com/photo-1545262810-a9b8f4c5f5e5?w=800',
      fuels: [
        { type: 'Benzene',  available: false, remainingQuantity: 0,    pricePerLiter: 52.66 },
        { type: 'Diesel',   available: true,  remainingQuantity: 1800, pricePerLiter: 49.50 },
        { type: 'Kerosene', available: true,  remainingQuantity: 600,  pricePerLiter: 38.00 },
      ],
      queueSize: 8, distance: 0,
    }],
    ['station-5', {
      id: 'station-5', name: 'Kobil CMC',
      location: { lat: 9.0456, lng: 38.8012, address: 'CMC Road, Addis Ababa' },
      workingHours: 'Open 24/7',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      fuels: [
        { type: 'Benzene', available: true, remainingQuantity: 2200, pricePerLiter: 52.66 },
        { type: 'Diesel',  available: true, remainingQuantity: 1900, pricePerLiter: 49.50 },
      ],
      queueSize: 2, distance: 0,
    }],
  ]);
}
export const stations: Map<string, Station> = global.__fuelq_stations;

// ── Helpers ───────────────────────────────────────────────────────────────────

export function findPaymentByTxRef(txRef: string): Payment | undefined {
  for (const p of Array.from(payments.values())) {
    if (p.txRef === txRef) return p;
  }
}

export function getUserActiveQueue(userId: string): Queue | undefined {
  for (const q of Array.from(queues.values())) {
    if (q.driverId === userId && (q.status === 'pending' || q.status === 'active')) return q;
  }
}

export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dG = ((lng2 - lng1) * Math.PI) / 180;
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dG / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
