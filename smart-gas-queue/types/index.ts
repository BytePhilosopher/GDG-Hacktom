// ─── Core domain types ────────────────────────────────────────────────────────

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'driver' | 'station_admin';
  stationId?: string; // only for station_admin
  stationName?: string; // only for station_admin
  vehicleInfo?: {
    // optional — admins have no vehicle
    plateNumber: string;
    vehicleType: VehicleType;
    licenseNumber: string;
  };
  createdAt: string;
}

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van';

/** The fuel grades sold across the platform. Single source of truth. */
export type FuelType = 'Benzene' | 'Diesel' | 'Kerosene';

export interface Station {
  id: string;
  name: string;
  location: { lat: number; lng: number; address: string };
  workingHours: string;
  imageUrl: string;
  fuels: Fuel[];
  queueSize?: number;
  distance?: number;
}

export interface Fuel {
  type: FuelType;
  available: boolean;
  remainingQuantity: number;
  pricePerLiter: number;
}

export interface Queue {
  id: string;
  driverId: string;
  stationId: string;
  stationName?: string;
  fuelType: FuelType;
  liters: number;
  totalPrice: number;
  advancePayment: number;
  paidAmount: number;
  position: number;
  estimatedWait: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  queueId: string;
  userId: string;
  txRef: string;
  amount: number;
  currency: 'ETB';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  chapaRef?: string;
  method?: string;
  initiatedAt: string;
  verifiedAt?: string;
  refundedAt?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

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

// ─── Map ──────────────────────────────────────────────────────────────────────

export interface LatLng {
  lat: number;
  lng: number;
}

// ─── Queue helpers ────────────────────────────────────────────────────────────

export interface QueueRequest {
  stationId: string;
  fuelType: FuelType;
  liters: number;
  totalPrice: number;
  advancePayment: number;
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

// ─── Chapa payment types ──────────────────────────────────────────────────────

export interface PaymentPayload {
  fuelType: FuelType;
  liters: number;
  pricePerLiter: number;
  stationId: string;
  queueId: string;
}

export interface ChapaInitResponse {
  checkoutUrl: string;
  txRef: string;
  advanceAmount: number;
  totalAmount: number;
}

export interface ChapaVerifyResponse {
  verified: boolean;
  success: boolean;
  queueId?: string;
  status?: string;
  amount?: number;
  method?: string;
  message?: string;
}

export interface ChapaRawInitResponse {
  /** Plain message on success; a field→errors map on validation failure. */
  message: string | Record<string, string[]>;
  status: string;
  data: { checkout_url: string };
}

export interface ChapaRawVerifyResponse {
  message: string;
  status: string;
  data: {
    status: string;
    reference: string;
    tx_ref: string;
    amount: string;
    currency: string;
    method: string;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
    updated_at: string;
  };
}
