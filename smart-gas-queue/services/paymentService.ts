import { ChapaInitResponse, ChapaVerifyResponse } from '@/types';

export interface PaymentInitPayload {
  stationId: string;
  queueId:   string;
  fuelType:  string;
  liters:    number;
  amount:    number;
}

class PaymentService {
  /**
   * POST /api/payments/initialize
   * Uses fetch with credentials so the Supabase session cookie is sent.
   */
  async initializePayment(payload: PaymentInitPayload): Promise<ChapaInitResponse> {
    const res = await fetch('/api/payments/initialize', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error ?? `Payment initialization failed (${res.status})`);
    }
    return data as ChapaInitResponse;
  }

  /**
   * GET /api/payments/verify/:txRef
   * Uses fetch with credentials so the Supabase session cookie is sent.
   */
  async verifyPayment(txRef: string): Promise<ChapaVerifyResponse> {
    const res = await fetch(
      `/api/payments/verify/${encodeURIComponent(txRef)}`,
      { credentials: 'include' }
    );

    const data = await res.json();
    if (!res.ok && res.status !== 404) {
      throw new Error(data.error ?? `Payment verification failed (${res.status})`);
    }
    return data as ChapaVerifyResponse;
  }
}

export const paymentService = new PaymentService();
