import type { FuelType, Queue } from '@/types';

/**
 * Shape of a `queues` row as returned by Supabase (snake_case), optionally
 * joined with the parent station. Fields are optional because different
 * queries select different column sets and Realtime payloads are partial.
 */
export interface RawQueueRow {
  id: string;
  driver_id?: string;
  driverId?: string;
  station_id?: string;
  stationId?: string;
  stations?: { name?: string } | null;
  stationName?: string;
  fuel_type?: FuelType;
  fuelType?: FuelType;
  liters?: number;
  total_price?: number;
  totalPrice?: number;
  advance_payment?: number;
  advancePayment?: number;
  paid_amount?: number;
  paidAmount?: number;
  position?: number;
  estimated_wait?: number;
  estimatedWait?: number;
  status?: Queue['status'];
  payment_status?: Queue['paymentStatus'];
  paymentStatus?: Queue['paymentStatus'];
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

/**
 * Normalize a raw `queues` row (snake_case from Supabase, or an already-mapped
 * camelCase object) into the domain `Queue` type. Single source of truth for
 * the mapping used by both the service layer and the realtime hook.
 */
export function toQueue(raw: RawQueueRow): Queue {
  return {
    id: raw.id,
    driverId: raw.driver_id ?? raw.driverId ?? '',
    stationId: raw.station_id ?? raw.stationId ?? '',
    stationName: raw.stations?.name ?? raw.stationName,
    fuelType: (raw.fuel_type ?? raw.fuelType) as FuelType,
    liters: raw.liters ?? 0,
    totalPrice: raw.total_price ?? raw.totalPrice ?? 0,
    advancePayment: raw.advance_payment ?? raw.advancePayment ?? 0,
    paidAmount: raw.paid_amount ?? raw.paidAmount ?? 0,
    position: raw.position ?? 0,
    estimatedWait: raw.estimated_wait ?? raw.estimatedWait ?? 0,
    status: raw.status ?? 'pending',
    paymentStatus: raw.payment_status ?? raw.paymentStatus ?? 'pending',
    createdAt: raw.created_at ?? raw.createdAt ?? '',
    updatedAt: raw.updated_at ?? raw.updatedAt ?? '',
  };
}
