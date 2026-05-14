// ─── Core domain types ────────────────────────────────────────────────────────

export interface User {
  id:          string;
  fullName:    string;
  email:       string;
  phone:       string;
  vehicleInfo: {
    plateNumber:   string;
    vehicleType:   VehicleType;
    licenseNumber: string;
  };
  createdAt: string;
}

export type VehicleType = 'sedan' | 'suv' | 'truck' | 'motorcycle' | 'van';

export interface Station {
  id:           string;
  name:         string;
  location:     { lat: number; lng: number; address: string };
  workingHours: string;
  imageUrl:     string;
  fuels:        Fuel[];
  queueSize?:   number;
  distance?:    number;
}

export interface Fuel {
  type:              'Benzene' | 'Diesel' | 'Kerosene';
  available:         boolean;
  remainingQuantity: number;
  pricePerLiter:     number;
}

export interface Queue {
  id:             string;
  driverId:       string;
  stationId:      string;
  stationName?:   string;
  fuelType:       string;
  liters:         number;
  totalPrice:     number;
  advancePayment: number;
  paidAmount:     number;
  position:       number;
  estimatedWait:  number;
  status:         'pending' | 'active' | 'completed' | 'cancelled';
  paymentStatus:  'pending' | 'paid' | 'failed' | 'refunded';
  createdAt:      string;
  updatedAt:      string;
}

export interface Payment {
  id:          string;
  queueId:     string;
  userId:      string;
  txRef:       string;
  amount:      number;
  currency:    'ETB';
  status:      'pending' | 'success' | 'failed' | 'refunded';
  chapaRef?:   string;
  method?:     string;
  initiatedAt: string;
  verifiedAt?: string;
  refundedAt?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginCredentials { email: string; password: string; }

export interface RegisterInput {
  fullName:        string;
  phone:           string;
  email:           string;
  plateNumber:     string;
  vehicleType:     VehicleType;
  licenseNumber:   string;
  password:        string;
  confirmPassword: string;
}

export interface AuthResponse {
  user:  User;
  token: string;
}

// ─── Map ──────────────────────────────────────────────────────────────────────

export interface LatLng { lat: number; lng: number; }

// ─── Queue helpers ────────────────────────────────────────────────────────────

export interface QueueRequest {
  stationId:      string;
  fuelType:       string;
  liters:         number;
  totalPrice:     number;
  advancePayment: number;
}

export interface QueuePosition {
  position:      number;
  estimatedWait: number;
  totalInQueue:  number;
}

export interface QueueUpdate {
  position:      number;
  estimatedWait: number;
}

// ─── Chapa payment types ──────────────────────────────────────────────────────

export interface PaymentPayload {
  fuelType:      'Benzene' | 'Diesel' | 'Kerosene';
  liters:        number;
  pricePerLiter: number;
  stationId:     string;
  queueId:       string;
}

export interface ChapaInitResponse {
  checkoutUrl:   string;
  txRef:         string;
  advanceAmount: number;
  totalAmount:   number;
}

export interface ChapaVerifyResponse {
  verified:  boolean;
  success:   boolean;
  queueId?:  string;
  status?:   string;
  amount?:   number;
  method?:   string;
  message?:  string;
}

export interface ChapaRawInitResponse {
  message: string;
  status:  string;
  data:    { checkout_url: string };
}

export interface ChapaRawVerifyResponse {
  message: string;
  status:  string;
  data: {
    status:     string;
    reference:  string;
    tx_ref:     string;
    amount:     string;
    currency:   string;
    method:     string;
    email:      string;
    first_name: string;
    last_name:  string;
    created_at: string;
    updated_at: string;
  };
}

// Legacy — kept so existing frontend code compiles
export interface PaymentInitData {
  amount:    number;
  email:     string;
  firstName: string;
  lastName:  string;
  queueId:   string;
  fuelType:  string;
  liters:    number;
}

export interface PaymentResponse {
  status:  string;
  message: string;
  data:    { checkout_url: string; tx_ref: string };
}
