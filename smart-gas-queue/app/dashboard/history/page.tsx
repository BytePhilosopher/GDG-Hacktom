'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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

  useEffect(() => {
    queueService.getHistory().then(setHistory).finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen text="Loading history..." />;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors -ml-2"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-900">Queue History</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto pt-5">
        <RecentActivityList items={history} />
      </main>

      <BottomNavigation />
    </div>
  );
}
