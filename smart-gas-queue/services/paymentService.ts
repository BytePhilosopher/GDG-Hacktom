import { PaymentInitData, PaymentResponse } from '@/types';

export class PaymentService {
  async initializePayment(data: PaymentInitData): Promise<PaymentResponse> {
    // In production, this calls your backend which calls Chapa API
    // The secret key should NEVER be exposed on the frontend
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock response - replace with real Chapa API call via your backend
    return {
      status: 'success',
      message: 'Hosted Link',
      data: {
        checkout_url: `${window.location.origin}/queue/${data.queueId}?payment=success&tx_ref=queue-${Date.now()}`,
        tx_ref: `queue-${Date.now()}`,
      },
    };
  }

  async verifyPayment(txRef: string): Promise<{ status: string; verified: boolean }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return { status: 'success', verified: true };
  }
}

export const paymentService = new PaymentService();
