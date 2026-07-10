'use client';

import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';
import { useAdminQueueRealtime } from '@/hooks/useAdminQueueRealtime';
import { useAuth } from '@/contexts/AuthContext';
import { QueueTable } from '@/components/admin/QueueTable';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { cn } from '@/lib/utils';
import type { FuelType } from '@/types';

type FuelFilter = 'All' | FuelType;

export default function AdminQueuePage() {
  const { user } = useAuth();
  const { queue, setQueue, isLive, loading, error, refetch } = useAdminQueueRealtime(
    user?.stationId
  );
  const [fuelFilter, setFuelFilter] = useState<FuelFilter>('All');
  const [search, setSearch] = useState('');

  // ─── Queue Actions (optimistic UI) ───────────────────────────────────────

  const handleComplete = useCallback(
    async (id: string) => {
      setQueue((prev) =>
        prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, position: i + 1 }))
      );
      try {
        await adminService.completeDriver(id);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to mark complete');
        void refetch();
      }
    },
    [setQueue, refetch]
  );

  const handleSkip = useCallback(
    async (id: string) => {
      setQueue((prev) => {
        const entry = prev.find((e) => e.id === id);
        if (!entry) return prev;
        const rest = prev.filter((e) => e.id !== id);
        return [...rest, entry].map((e, i) => ({ ...e, position: i + 1 }));
      });
      try {
        await adminService.skipDriver(id);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to skip driver');
        void refetch();
      }
    },
    [setQueue, refetch]
  );

  const handleRemove = useCallback(
    async (id: string) => {
      setQueue((prev) =>
        prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, position: i + 1 }))
      );
      try {
        await adminService.removeDriver(id);
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Failed to remove driver');
        void refetch();
      }
    },
    [setQueue, refetch]
  );

  // ─── Filtering ────────────────────────────────────────────────────────────

  const filtered = queue.filter((e) => {
    const matchesFuel = fuelFilter === 'All' || e.fuelType === fuelFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q || e.driverName.toLowerCase().includes(q) || e.plateNumber.toLowerCase().includes(q);
    return matchesFuel && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Queue Management</h1>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Manage drivers waiting at your station
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-wrap gap-2">
          {(['All', 'Benzene', 'Diesel', 'Kerosene'] as FuelFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFuelFilter(f)}
              aria-pressed={fuelFilter === f}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-sm font-medium ring-1 ring-inset transition-all duration-200 ease-premium',
                fuelFilter === f
                  ? 'bg-brand-gradient text-white shadow-brand-glow ring-transparent'
                  : 'bg-white text-gray-600 ring-gray-950/[0.06] hover:text-red-600 hover:ring-red-300'
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative sm:ml-auto">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
            aria-hidden
          />
          <input
            type="text"
            placeholder="Search by name or plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl bg-white pl-9 pr-4 text-sm text-gray-900 shadow-soft ring-1 ring-inset ring-gray-950/[0.06] transition-all duration-200 ease-premium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/40 sm:w-64"
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner className="py-20" text="Loading queue…" />
      ) : error ? (
        <ErrorState
          title="Couldn’t load the queue"
          message="We couldn’t reach the server. Please try again."
          onRetry={() => void refetch()}
        />
      ) : (
        <QueueTable
          entries={filtered}
          onComplete={handleComplete}
          onSkip={handleSkip}
          onRemove={handleRemove}
          isLive={isLive}
        />
      )}
    </div>
  );
}
