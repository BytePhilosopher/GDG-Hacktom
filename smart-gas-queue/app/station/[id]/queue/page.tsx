'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StationHeader } from '@/components/stations/StationHeader';
import { FuelAvailabilityTable } from '@/components/stations/FuelAvailabilityTable';
import { FuelRequestForm } from '@/components/queue/FuelRequestForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { stationService } from '@/services/stationService';
import { queueService } from '@/services/queueService';
import { paymentService } from '@/services/paymentService';
import { Station } from '@/types';

export default function QueuePage({ params }: { params: { id: string } }) {
  return (
    <ProtectedRoute>
      <QueuePageContent stationId={params.id} />
    </ProtectedRoute>
  );
}

function QueuePageContent({ stationId }: { stationId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [station, setStation]       = useState<Station | null>(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError]   = useState('');

  useEffect(() => {
    stationService
      .getStationById(stationId)
      .then(setStation)
      .catch(() => setPageError('Station not found'))
      .finally(() => setLoading(false));
  }, [stationId]);

  const handleSubmit = async (data: {
    fuelType: string;
    liters: number;
    totalPrice: number;
    advancePayment: number;
  }) => {
    if (!station || !user) return;
    setSubmitting(true);

    try {
      // 1. Create queue entry in the store
      const queue = await queueService.joinQueue({
        stationId:      station.id,
        fuelType:       data.fuelType,
        liters:         data.liters,
        totalPrice:     data.totalPrice,
        advancePayment: data.advancePayment,
      });

      // 2. Initialize Chapa payment
      const payment = await paymentService.initializePayment({
        stationId: station.id,
        queueId:   queue.id,
        fuelType:  data.fuelType,
        liters:    data.liters,
        amount:    data.advancePayment,
      });

      // 3. Save for recovery if browser closes
      sessionStorage.setItem('pending_tx_ref',   payment.txRef);
      sessionStorage.setItem('pending_queue_id', queue.id);

      // 4. Redirect to Chapa checkout
      window.location.href = payment.checkoutUrl;

    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Payment could not be processed. Please try again or use a different payment method.';
      toast.error(msg, { duration: 6000 });
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading station..." />;

  if (pageError || !station) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">{pageError || 'Station not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-red-600 font-medium hover:underline"
          >
            Back to map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <StationHeader station={station} />
      <FuelAvailabilityTable fuels={station.fuels} />
      <FuelRequestForm
        fuels={station.fuels}
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </div>
  );
}
