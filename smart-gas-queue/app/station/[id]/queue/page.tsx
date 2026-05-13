'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

interface QueuePageProps {
  params: { id: string };
}

export default function QueuePage({ params }: QueuePageProps) {
  return (
    <ProtectedRoute>
      <QueuePageContent stationId={params.id} />
    </ProtectedRoute>
  );
}

function QueuePageContent({ stationId }: { stationId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const [station, setStation] = useState<Station | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    stationService
      .getStationById(stationId)
      .then(setStation)
      .catch(() => setError('Station not found'))
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
      // First join the queue
      const queue = await queueService.joinQueue({
        stationId: station.id,
        fuelType: data.fuelType,
        liters: data.liters,
        totalPrice: data.totalPrice,
        advancePayment: data.advancePayment,
      });

      // Then initialize payment
      const payment = await paymentService.initializePayment({
        amount: data.advancePayment,
        email: user.email,
        firstName: user.fullName.split(' ')[0],
        lastName: user.fullName.split(' ').slice(1).join(' ') || '',
        queueId: queue.id,
        fuelType: data.fuelType,
        liters: data.liters,
      });

      // Redirect to Chapa checkout (or queue page in demo)
      window.location.href = payment.data.checkout_url;
    } catch {
      setError('Failed to process your request. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading station..." />;

  if (error || !station) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">{error || 'Station not found'}</p>
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
