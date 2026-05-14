export interface AdminUser {
  id: string;
  name: string;
  email: string;
  stationId: string;
  stationName: string;
}

export interface QueueEntry {
  id: string;
  position: number;
  driverName: string;
  plateNumber: string;
  fuelType: 'Benzene' | 'Diesel' | 'Kerosene';
  liters: number;
  totalPrice: number;
  advancePaid: number;
  joinedAt: Date;
  status: 'waiting' | 'serving' | 'completed' | 'cancelled';
}

export interface AdminFuel {
  type: 'Benzene' | 'Diesel' | 'Kerosene';
  available: boolean;
  stockLiters: number;
  pricePerLiter: number;
}

export interface StationStats {
  totalInQueue: number;
  completedToday: number;
  totalFuelRemaining: number;
}
