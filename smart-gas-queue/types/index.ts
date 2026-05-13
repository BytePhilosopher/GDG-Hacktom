export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  vehicleInfo: {
    plateNumber: string;
    vehicleType: VehicleType;
    licenseNumber: string;
  };
  createdAt: Date;
}

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van';

export interface Station {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  workingHours: string;
  imageUrl: string;
  fuels: Fuel[];
  distance?: number;
}

export interface Fuel {
  type: 'Benzene' | 'Diesel' | 'Kerosene';
  available: boolean;
  remainingQuantity: number;
  pricePerLiter: number;
}

export interface QueueRequest {
  stationId: string;
  fuelType: string;
  liters: number;
  totalPrice: number;
  advancePayment: number;
}

export interface Queue {
  id: string;
  driverId: string;
  stationId: string;
  stationName: string;
  fuelType: string;
  liters: number;
  totalPrice: number;
  advancePayment: number;
  paidAmount: number;
  position: number;
  estimatedWait: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentInitData {
  amount: number;
  email: string;
  firstName: string;
  lastName: string;
  queueId: string;
  fuelType: string;
  liters: number;
}

export interface PaymentResponse {
  status: string;
  message: string;
  data: {
    checkout_url: string;
    tx_ref: string;
  };
}

export interface LatLng {
  lat: number;
  lng: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterInput {
  fullName: string;
  phone: string;
  email: string;
  plateNumber: string;
  vehicleType: VehicleType;
  licenseNumber: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface QueuePosition {
  position: number;
  estimatedWait: number;
  totalInQueue: number;
}

export interface QueueUpdate {
  position: number;
  estimatedWait: number;
}
