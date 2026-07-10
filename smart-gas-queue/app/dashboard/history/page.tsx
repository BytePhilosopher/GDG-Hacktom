'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { queueService } from '@/services/queueService';
import { Queue } from '@/types';

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryContent />
    </ProtectedRoute>
  );
}

function HistoryContent() {
  const [history, setHistory] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    queueService
      .getHistory()
      .then(setHistory)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner fullScreen text="Loading history..." />;
  if (error) {
    return (
      <ErrorState
        fullScreen
        title="Couldn’t load your history"
        message="We couldn’t reach the server. Please check your connection and try again."
        onRetry={load}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="glass sticky top-0 z-10 border-b border-gray-950/[0.06]">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <Link
            href="/dashboard"
            className="-ml-2 rounded-full p-2 transition-colors hover:bg-gray-900/5"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" aria-hidden />
          </Link>
          <h1 className="font-bold tracking-tight text-gray-900">Queue History</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg pt-5">
        <RecentActivityList items={history} />
      </main>

      <BottomNavigation />
    </div>
  );
}
