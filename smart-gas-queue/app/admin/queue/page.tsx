'use client';

import React, { useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { useAdminQueueRealtime } from '@/hooks/useAdminQueueRealtime';
import { useAuth } from '@/contexts/AuthContext';
import { QueueTable } from '@/components/admin/QueueTable';

type FuelFilter = 'All' | 'Benzene' | 'Diesel' | 'Kerosene';

export default function AdminQueuePage() {
  const { user }                    = useAuth();
  const { queue, setQueue, isLive } = useAdminQueueRealtime(user?.stationId);
  const [fuelFilter, setFuelFilter] = useState<FuelFilter>('All');
  const [search, setSearch]         = useState('');

  // ─── Queue Actions (optimistic UI) ───────────────────────────────────────

  const handleComplete = useCallback(async (id: string) => {
    setQueue((prev) =>
      prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, position: i + 1 }))
    );
    await adminService.completeDriver(id);
  }, [setQueue]);

  const handleSkip = useCallback(async (id: string) => {
    setQueue((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (!entry) return prev;
      const rest = prev.filter((e) => e.id !== id);
      return [...rest, entry].map((e, i) => ({ ...e, position: i + 1 }));
    });
    await adminService.skipDriver(id);
  }, [setQueue]);

  const handleRemove = useCallback(async (id: string) => {
    setQueue((prev) =>
      prev.filter((e) => e.id !== id).map((e, i) => ({ ...e, position: i + 1 }))
    );
    await adminService.removeDriver(id);
  }, [setQueue]);

  // ─── Filtering ────────────────────────────────────────────────────────────

  const filtered = queue.filter((e) => {
    const matchesFuel = fuelFilter === 'All' || e.fuelType === fuelFilter;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      e.driverName.toLowerCase().includes(q) ||
      e.plateNumber.toLowerCase().includes(q);
    return matchesFuel && matchesSearch;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage drivers waiting at your station
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-2 flex-wrap">
          {(['All', 'Benzene', 'Diesel', 'Kerosene'] as FuelFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFuelFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                fuelFilter === f
                  ? 'bg-red-600 text-white border-red-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="relative sm:ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or plate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-64 h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-500/20 transition-all"
          />
        </div>
      </div>

      <QueueTable
        entries={filtered}
        onComplete={handleComplete}
        onSkip={handleSkip}
        onRemove={handleRemove}
        isLive={isLive}
      />
    </div>
  );
}
