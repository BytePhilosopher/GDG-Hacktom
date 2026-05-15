'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Bell, X, ArrowLeft, Share2, AlertCircle, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { QueuePositionCard } from '@/components/queue/QueuePositionCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useQueuePosition } from '@/hooks/useQueuePosition';
import { queueService } from '@/services/queueService';
import { paymentService } from '@/services/paymentService';
import Link from 'next/link';

export default function QueuePositionPage({ params }: { params: Promise<{ queueId: string }> }) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<LoadingSpinner fullScreen text="Loading…" />}>
        <QueuePositionPageInner params={params} />
      </Suspense>
    </ProtectedRoute>
  );
}

function QueuePositionPageInner({ params }: { params: Promise<{ queueId: string }> }) {
  const resolvedParams = React.use(params);
  return <QueuePositionContent queueId={resolvedParams.queueId} />;
}

type VerifyState = 'idle' | 'verifying' | 'success' | 'failed';

function QueuePositionContent({ queueId }: { queueId: string }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  // Chapa sends trx_ref in return_url; we also accept tx_ref
  const txRef = searchParams.get('trx_ref') ?? searchParams.get('tx_ref');

  const { queue, loading: queueLoading } = useQueuePosition(queueId);
  const [verifyState, setVerifyState]   = useState<VerifyState>(txRef ? 'verifying' : 'idle');
  const [verifyError, setVerifyError]   = useState('');
  const [cancelling, setCancelling]     = useState(false);
  const [showCancel, setShowCancel]     = useState(false);
  const [notifyOn, setNotifyOn]         = useState(false);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!txRef || hasVerified.current) return;
    hasVerified.current = true;
    runVerify(txRef);
  }, [txRef]);  

  async function runVerify(ref: string) {
    setVerifyState('verifying');
    setVerifyError('');
    try {
      const result = await paymentService.verifyPayment(ref);
      if (result.verified || result.success) {
        setVerifyState('success');
        toast.success('Payment confirmed! You are in the queue.');
      } else {
        setVerifyState('failed');
        setVerifyError(
          result.message ?? 'Payment was not completed. Please try again.'
        );
      }
    } catch {
      setVerifyState('failed');
      setVerifyError('Could not verify your payment. Please check your connection and try again.');
    }
  }

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await queueService.cancelQueue(queueId);
      toast.success('Queue request cancelled.');
      router.push('/dashboard');
    } catch {
      toast.error('Could not cancel. Please try again.');
      setCancelling(false);
    }
  };

  const handleNotify = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((p) => {
        if (p === 'granted') {
          setNotifyOn(true);
          toast.success('You will be notified when your turn is near.');
        } else {
          toast.error('Notification permission denied.');
        }
      });
    } else {
      setNotifyOn(true);
    }
  };

  // ── Verifying ────────────────────────────────────────────────────────────
  if (verifyState === 'verifying') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
        <p className="font-semibold text-gray-900">Verifying your payment…</p>
        <p className="text-sm text-gray-500">This only takes a moment</p>
      </div>
    );
  }

  // ── Failed ───────────────────────────────────────────────────────────────
  if (verifyState === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 p-6 max-w-sm mx-auto">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">Payment Not Confirmed</h2>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">{verifyError}</p>
        </div>
        <div className="w-full space-y-3">
          {txRef && (
            <Button className="w-full" onClick={() => runVerify(txRef)}>
              <RefreshCw className="w-4 h-4" /> Retry Verification
            </Button>
          )}
          <Button variant="secondary" className="w-full" onClick={() => router.push('/')}>
            Back to Map
          </Button>
        </div>
      </div>
    );
  }

  // ── Queue loading ────────────────────────────────────────────────────────
  if (queueLoading) return <LoadingSpinner fullScreen text="Loading queue…" />;

  if (!queue) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <p className="text-gray-500">Queue not found</p>
          <Link href="/dashboard" className="mt-4 text-red-600 font-medium hover:underline block">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-gray-100 -ml-2" aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-900">Queue Status</h1>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            onClick={() => navigator.share?.({ title: 'My Queue Position', url: window.location.href })}
            aria-label="Share"
          >
            <Share2 className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        <AnimatePresence>
          {verifyState === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3"
            >
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-emerald-800">Payment Confirmed!</p>
                <p className="text-xs text-emerald-600">You&apos;ve been added to the queue</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <QueuePositionCard queue={queue} />

        <div className="space-y-3">
          <Button
            variant={notifyOn ? 'secondary' : 'outline'}
            className="w-full"
            onClick={handleNotify}
            disabled={notifyOn}
          >
            <Bell className="w-4 h-4" />
            {notifyOn ? 'Notifications Enabled ✓' : 'Notify Me When Close'}
          </Button>

          {!showCancel ? (
            <Button variant="danger" className="w-full" onClick={() => setShowCancel(true)}>
              <X className="w-4 h-4" /> Cancel Queue Request
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
                <Button variant="secondary" className="flex-1" onClick={() => setShowCancel(false)}>
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
