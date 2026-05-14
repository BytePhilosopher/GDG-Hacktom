'use client';

import React, { useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { paymentService } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/lib/utils';

interface PaymentButtonProps {
  amount:    number;
  queueData: {
    id:        string;
    fuelType:  string;
    liters:    number;
    stationId: string;
  };
}

export function PaymentButton({ amount, queueData }: PaymentButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!user) { toast.error('Please sign in first.'); return; }
    setLoading(true);

    try {
      const result = await paymentService.initializePayment({
        stationId: queueData.stationId,
        queueId:   queueData.id,
        fuelType:  queueData.fuelType,
        liters:    queueData.liters,
        amount,
      });

      sessionStorage.setItem('pending_tx_ref',   result.txRef);
      sessionStorage.setItem('pending_queue_id', queueData.id);

      window.location.href = result.checkoutUrl;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Payment failed to start. Please try again.';
      toast.error(msg, { duration: 6000 });
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="w-full h-14 flex items-center justify-center gap-2 rounded-xl text-white text-lg font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
      style={{ backgroundColor: loading ? '#27AE60' : '#2ECC71' }}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Connecting to Chapa…
        </>
      ) : (
        <>
          <Wallet className="w-5 h-5" />
          Pay {formatCurrency(amount)} via Chapa
        </>
      )}
    </button>
  );
}
