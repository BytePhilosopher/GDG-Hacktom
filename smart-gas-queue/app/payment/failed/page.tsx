'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<FailedScreen txRef={null} />}>
      <PaymentFailedContent />
    </Suspense>
  );
}

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get('trx_ref') ?? searchParams.get('tx_ref');
  const router = useRouter();
  return (
    <FailedScreen txRef={txRef} onRetry={() => router.back()} onHome={() => router.push('/')} />
  );
}

function FailedScreen({
  txRef,
  onRetry,
  onHome,
}: {
  txRef: string | null;
  onRetry?: () => void;
  onHome?: () => void;
}) {
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
        <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-gray-600">
          Your queue slot was not reserved. No charge was made.
        </p>
        {txRef && (
          <p className="mt-4 inline-block rounded-full bg-gray-100 px-3 py-1 font-mono text-xs text-gray-600">
            Reference: {txRef}
          </p>
        )}
        <div className="mt-6 space-y-3">
          {onRetry && (
            <Button className="w-full" onClick={onRetry}>
              Try Again
            </Button>
          )}
          {onHome && (
            <Button variant="secondary" className="w-full" onClick={onHome}>
              Back to Map
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
