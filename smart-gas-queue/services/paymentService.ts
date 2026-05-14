import api from '@/lib/axios';
import { ChapaInitResponse, ChapaVerifyResponse } from '@/types';

export interface PaymentInitPayload {
  stationId:  string;
  queueId:    string;
  fuelType:   string;
  liters:     number;
  amount:     number;
}

class PaymentService {
  /** POST /api/payments/initialize — returns Chapa checkoutUrl + txRef */
  async initializePayment(payload: PaymentInitPayload): Promise<ChapaInitResponse> {
    const { data } = await api.post<ChapaInitResponse>('/payments/initialize', payload);
    return data;
  }

  /** GET /api/payments/verify/[txRef] — verifies a Chapa transaction */
  async verifyPayment(txRef: string): Promise<ChapaVerifyResponse> {
    const { data } = await api.get<ChapaVerifyResponse>(
      `/payments/verify/${encodeURIComponent(txRef)}`
    );
    return data;
  }
}

export const paymentService = new PaymentService();
