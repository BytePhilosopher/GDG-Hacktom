'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { QueueEntry } from '@/types/admin';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { QueueTable } from '@/components/admin/QueueTable';

type FuelFilter = 'All' | 'Benzene' | 'Diesel' | 'Kerosene';

export default function AdminQueuePage() {
  const { adminUser } = useAdminAuth();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [fuelFilter, setFuelFilter] = useState<FuelFilter>('All');
  const [search, setSearch] = useState('');
  // Mock socket connection state — swap with real socket later
  const [isLive] = useState(true);

  useEffect(() => {
    if (!adminUser) return;
    adminService.getQueue(adminUser.stationId).then((q) => {
      setQueue(q);
      setLoading(false);
    });
  }, [adminUser]);

  // ─── Queue Actions ────────────────────────────────────────────────────────

  const handleComplete = useCallback(async (id: string) => {
    // Optimistic: remove from queue and re-number positions
    setQueue((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      return filtered.map((e, i) => ({ ...e, position: i + 1 }));
    });
    await adminService.completeEntry(id);
  }, []);

  const handleSkip = useCallback(async (id: string) => {
    // Optimistic: move to end of queue
    setQueue((prev) => {
      const idx = prev.findIndex((e) => e.id === id);
      if (idx === -1) return prev;
      const entry = prev[idx];
      const rest = prev.filter((e) => e.id !== id);
      const updated = [...rest, entry].map((e, i) => ({ ...e, position: i + 1 }));
      return updated;
    });
    await adminService.skipEntry(id);
  }, []);

  const handleRemove = useCallback(async (id: string) => {
    setQueue((prev) => {
      const filtered = prev.filter((e) => e.id !== id);
      return filtered.map((e, i) => ({ ...e, position: i + 1 }));
    });
    await adminService.removeEntry(id);
  }, []);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
        {/* Fuel type filter */}
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

        {/* Search */}
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

      {/* Table */}
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
