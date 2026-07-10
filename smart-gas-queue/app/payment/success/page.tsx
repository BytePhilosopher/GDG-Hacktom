'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { paymentService } from '@/services/paymentService';
import { Button } from '@/components/ui/Button';

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<VerifyingScreen txRef={null} />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

type State = 'verifying' | 'success' | 'failed';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get('trx_ref') ?? searchParams.get('tx_ref');
  const queueId = searchParams.get('queueId') ?? undefined;
  const router = useRouter();

  const [state, setState] = useState<State>('verifying');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!txRef) {
      setState('failed');
      setErrorMsg('No payment reference found.');
      return;
    }

    let attempts = 0;
    const maxAttempts = 3;

    async function verify() {
      try {
        const result = await paymentService.verifyPayment(txRef!);
        if (result.verified || result.success) {
          setState('success');
          const dest = result.queueId
            ? `/queue/${result.queueId}`
            : queueId
              ? `/queue/${queueId}`
              : '/dashboard';
          setTimeout(() => router.push(dest), 2000);
        } else {
          attempts++;
          if (attempts < maxAttempts) setTimeout(verify, 2000);
          else {
            setState('failed');
            setErrorMsg(result.message ?? 'Payment could not be confirmed.');
          }
        }
      } catch {
        attempts++;
        if (attempts < maxAttempts) setTimeout(verify, 2000);
        else {
          setState('failed');
          setErrorMsg('Could not reach the payment server. Please try again.');
        }
      }
    }

    verify();
  }, [txRef, queueId, router]);

  if (state === 'verifying') return <VerifyingScreen txRef={txRef} />;

  if (state === 'failed') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-premium ring-1 ring-gray-950/[0.06]"
        >
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
            <XCircle className="h-11 w-11 text-red-500" aria-hidden />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payment Failed</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-600">{errorMsg}</p>
          {txRef && (
            <p className="mt-4 inline-block rounded-full bg-gray-100 px-3 py-1 font-mono text-xs text-gray-600">
              Ref: {txRef}
            </p>
          )}
          <div className="mt-6 space-y-3">
            <Button className="w-full" onClick={() => router.back()}>
              Try Again
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => router.push('/')}>
              Back to Map
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-premium ring-1 ring-gray-950/[0.06]"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 ring-8 ring-emerald-50/50"
        >
          <CheckCircle className="h-14 w-14 text-emerald-500" aria-hidden />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Payment Confirmed</h1>
        <p className="mt-2 text-gray-600">Your spot in the queue is secured.</p>
        {txRef && (
          <p className="mt-4 inline-block rounded-full bg-gray-100 px-3 py-1 font-mono text-xs text-gray-600">
            Ref: {txRef}
          </p>
        )}
        <div className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" aria-hidden />
          Redirecting to your queue position…
        </div>
      </motion.div>
    </div>
  );
}

function VerifyingScreen({ txRef }: { txRef: string | null }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-premium ring-1 ring-gray-950/[0.06]">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
          <span
            className="absolute inset-0 animate-ping rounded-full bg-primary-100 opacity-60"
            aria-hidden
          />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary-50">
            <Loader2 className="h-10 w-10 animate-spin text-primary-600" aria-hidden />
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Verifying Payment…</h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-600">
          Please wait while we confirm your payment with Chapa.
        </p>
        {txRef && (
          <p className="mt-4 inline-block rounded-full bg-gray-100 px-3 py-1 font-mono text-xs text-gray-600">
            Ref: {txRef}
          </p>
        )}
      </div>
    </div>
  );
}
