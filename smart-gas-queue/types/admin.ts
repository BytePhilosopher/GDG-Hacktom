import type { FuelType } from './index';

export interface QueueEntry {
  id: string;
  position: number;
  driverName: string;
  plateNumber: string;
  fuelType: FuelType;
  liters: number;
  totalPrice: number;
  advancePaid: number;
  joinedAt: Date;
  status: 'waiting' | 'serving' | 'completed' | 'cancelled';
}

export interface AdminFuel {
  type: FuelType;
  available: boolean;
  stockLiters: number;
  pricePerLiter: number;
}

export interface StationStats {
  totalInQueue: number;
  completedToday: number;
  totalFuelRemaining: number;
}
