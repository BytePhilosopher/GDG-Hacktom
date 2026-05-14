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
import { Station } from '@/types';

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
  const [station, setStation]       = useState<Station | null>(null);
  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError]   = useState('');

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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
        <motion.div
          className="text-center max-w-sm"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-inner">
            <AlertCircle className="h-8 w-8" aria-hidden />
          </div>
          <p className="text-slate-700 font-medium">{pageError || 'Station not found'}</p>
          <p className="text-sm text-slate-500 mt-2">Check the link or pick another station from the map.</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              type="button"
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white px-5 py-3 text-sm font-semibold shadow-lg shadow-red-600/25 hover:bg-red-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Home className="h-4 w-4" aria-hidden />
              Back to map
            </motion.button>
            <motion.button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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
      <FuelRequestForm
        fuels={station.fuels}
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </motion.div>
  );
}
