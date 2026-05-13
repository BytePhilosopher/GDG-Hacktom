'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Bell, X, ArrowLeft, Share2 } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { QueuePositionCard } from '@/components/queue/QueuePositionCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQueuePosition } from '@/hooks/useQueuePosition';
import { queueService } from '@/services/queueService';
import Link from 'next/link';

interface QueuePositionPageProps {
  params: { queueId: string };
  searchParams: { payment?: string };
}

export default function QueuePositionPage({ params, searchParams }: QueuePositionPageProps) {
  return (
    <ProtectedRoute>
      <QueuePositionContent
        queueId={params.queueId}
        paymentSuccess={searchParams.payment === 'success'}
      />
    </ProtectedRoute>
  );
}

function QueuePositionContent({
  queueId,
  paymentSuccess,
}: {
  queueId: string;
  paymentSuccess: boolean;
}) {
  const router = useRouter();
  const { queue, loading } = useQueuePosition(queueId);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [notifyEnabled, setNotifyEnabled] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await queueService.cancelQueue(queueId);
      router.push('/dashboard');
    } catch {
      setCancelling(false);
    }
  };

  const handleNotify = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          setNotifyEnabled(true);
        }
      });
    } else {
      setNotifyEnabled(true);
    }
  };

  if (loading) return <LoadingSpinner fullScreen text="Loading queue..." />;

  if (!queue) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">Queue not found</p>
          <Link href="/dashboard" className="mt-4 text-red-600 font-medium hover:underline block">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors -ml-2"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-900">Queue Status</h1>
          <button
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Share queue"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: 'My Queue Position', url: window.location.href });
              }
            }}
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Payment success banner */}
        {paymentSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-emerald-800">Payment Successful!</p>
              <p className="text-xs text-emerald-600">You&apos;ve been added to the queue</p>
            </div>
          </motion.div>
        )}

        {/* Queue position card */}
        <QueuePositionCard queue={queue} />

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant={notifyEnabled ? 'secondary' : 'outline'}
            className="w-full"
            onClick={handleNotify}
            disabled={notifyEnabled}
          >
            <Bell className="w-4 h-4" />
            {notifyEnabled ? 'Notifications Enabled ✓' : 'Notify Me When Close'}
          </Button>

          {!showCancelConfirm ? (
            <Button
              variant="danger"
              className="w-full"
              onClick={() => setShowCancelConfirm(true)}
            >
              <X className="w-4 h-4" />
              Cancel Queue Request
            </Button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-medium text-red-800 text-center">
                Are you sure you want to cancel?
              </p>
              <p className="text-xs text-red-600 text-center">
                Your advance payment may not be refunded immediately.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(false)}
                >
                  Keep Queue
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={handleCancel}
                  isLoading={cancelling}
                >
                  Yes, Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
