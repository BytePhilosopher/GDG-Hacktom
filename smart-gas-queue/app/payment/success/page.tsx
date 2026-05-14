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
  const txRef   = searchParams.get('trx_ref') ?? searchParams.get('tx_ref');
  const queueId = searchParams.get('queueId') ?? undefined;
  const router  = useRouter();

  const [state, setState]       = useState<State>('verifying');
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
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center gap-5 p-6 max-w-sm mx-auto">
        <XCircle className="w-20 h-20 text-red-500" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">{errorMsg}</p>
          {txRef && <p className="text-xs text-gray-400 mt-2 font-mono">Ref: {txRef}</p>}
        </div>
        <Button className="w-full" onClick={() => router.back()}>Try Again</Button>
        <Button variant="secondary" className="w-full" onClick={() => router.push('/')}>
          Back to Map
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center gap-5 p-6"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
      >
        <CheckCircle className="w-24 h-24 text-emerald-500" />
      </motion.div>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Payment Confirmed!</h1>
        <p className="text-gray-500 mt-2">Your spot in the queue is secured.</p>
        {txRef && (
          <p className="text-xs text-gray-400 mt-2 font-mono bg-white px-3 py-1 rounded-full inline-block">
            Ref: {txRef}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-4">Redirecting to your queue position…</p>
      </div>
    </motion.div>
  );
}

function VerifyingScreen({ txRef }: { txRef: string | null }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 p-6">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin" />
      </div>
      <h1 className="text-xl font-bold text-gray-900">Verifying Payment…</h1>
      <p className="text-sm text-gray-500 text-center">
        Please wait while we confirm your payment with Chapa.
      </p>
      {txRef && (
        <p className="text-xs text-gray-400 font-mono bg-gray-100 px-3 py-1 rounded-full">
          Ref: {txRef}
        </p>
      )}
    </div>
  );
}
