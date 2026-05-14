'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const txRef  = searchParams.get('trx_ref') ?? searchParams.get('tx_ref');
  const router = useRouter();
  return <FailedScreen txRef={txRef} onRetry={() => router.back()} onHome={() => router.push('/')} />;
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
    <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center gap-5 p-6 max-w-sm mx-auto">
      <XCircle className="w-20 h-20 text-red-500" />
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
        <p className="text-gray-500 mt-2 text-sm">Your queue slot was not reserved. No charge was made.</p>
        {txRef && <p className="text-xs text-gray-400 mt-2 font-mono">Reference: {txRef}</p>}
      </div>
      {onRetry && <Button className="w-full" onClick={onRetry}>Try Again</Button>}
      {onHome  && <Button variant="secondary" className="w-full" onClick={onHome}>Back to Map</Button>}
    </div>
  );
}
