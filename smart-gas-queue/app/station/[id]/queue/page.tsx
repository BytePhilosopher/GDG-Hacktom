'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StationHeader } from '@/components/stations/StationHeader';
import { FuelAvailabilityTable } from '@/components/stations/FuelAvailabilityTable';
import { FuelRequestForm } from '@/components/queue/FuelRequestForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { stationService } from '@/services/stationService';
import { queueService } from '@/services/queueService';
import { paymentService } from '@/services/paymentService';
import { Station, FuelType } from '@/types';

export default function QueuePage() {
  const params = useParams();
  const stationId = typeof params.id === 'string' ? params.id : '';

  return (
    <ProtectedRoute>
      <QueuePageContent stationId={stationId} />
    </ProtectedRoute>
  );
}

function QueuePageContent({ stationId }: { stationId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');

  useEffect(() => {
    if (!stationId) {
      setPageError('Invalid station');
      setLoading(false);
      return;
    }
    stationService
      .getStationById(stationId)
      .then(setStation)
      .catch(() => setPageError('Station not found'))
      .finally(() => setLoading(false));
  }, [stationId]);

  const handleSubmit = async (data: {
    fuelType: FuelType;
    liters: number;
    totalPrice: number;
    advancePayment: number;
  }) => {
    if (!station || !user) return;
    setSubmitting(true);

    try {
      // 1. Create queue entry in the store
      const queue = await queueService.joinQueue({
        stationId: station.id,
        fuelType: data.fuelType,
        liters: data.liters,
        totalPrice: data.totalPrice,
        advancePayment: data.advancePayment,
      });

      // 2. Initialize Chapa payment
      const payment = await paymentService.initializePayment({
        stationId: station.id,
        queueId: queue.id,
        fuelType: data.fuelType,
        liters: data.liters,
        amount: data.advancePayment,
      });

      // 3. Save for recovery if browser closes
      sessionStorage.setItem('pending_tx_ref', payment.txRef);
      sessionStorage.setItem('pending_queue_id', queue.id);

      // 4. Redirect to Chapa checkout
      window.location.href = payment.checkoutUrl;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Payment could not be processed. Please try again or use a different payment method.';
      toast.error(msg, { duration: 6000 });
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading station..." />;

  if (pageError || !station) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <motion.div
          className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-premium ring-1 ring-gray-950/[0.06]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-8 ring-red-50/50">
            <AlertCircle className="h-8 w-8" aria-hidden />
          </div>
          <p className="text-lg font-bold tracking-tight text-gray-900">
            {pageError || 'Station not found'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-gray-600">
            Check the link or pick another station from the map.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3">
            <motion.button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-white shadow-brand-glow transition-all duration-200 ease-premium hover:brightness-[1.06]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="h-4 w-4" aria-hidden />
              Back to map
            </motion.button>
            <motion.button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-gray-900 shadow-soft ring-1 ring-gray-200 transition-all duration-200 ease-premium hover:bg-gray-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Go back
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gray-50 pb-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      <StationHeader station={station} />
      <FuelAvailabilityTable fuels={station.fuels} />
      <FuelRequestForm fuels={station.fuels} onSubmit={handleSubmit} isLoading={submitting} />
    </motion.div>
  );
}
