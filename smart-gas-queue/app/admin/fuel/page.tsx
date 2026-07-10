'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';
import { AdminFuel } from '@/types/admin';
import { FuelStatusCard } from '@/components/admin/FuelStatusCard';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AdminFuelPage() {
  const [fuels, setFuels] = useState<AdminFuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadFuels = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const f = await adminService.getFuels();
      setFuels(f);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load fuels';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFuels();
  }, [loadFuels]);

  const handleEdit = useCallback(async (updated: AdminFuel) => {
    let previous: AdminFuel | undefined;
    setFuels((prev) => {
      previous = prev.find((f) => f.type === updated.type);
      return prev.map((f) => (f.type === updated.type ? updated : f));
    });
    try {
      await adminService.updateFuel(updated);
      toast.success('Fuel inventory updated');
    } catch (e: unknown) {
      if (previous) {
        setFuels((prev) => prev.map((f) => (f.type === previous!.type ? previous! : f)));
      }
      const msg = e instanceof Error ? e.message : 'Could not save changes';
      toast.error(msg);
      throw e;
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Fuel Inventory</h1>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Update stock levels, pricing, and availability
          </p>
        </div>
        <div className="max-w-lg rounded-2xl bg-red-50 px-6 py-8 text-center ring-1 ring-inset ring-red-600/15">
          <p className="text-sm font-medium leading-relaxed text-red-800">{loadError}</p>
          <Button size="sm" onClick={() => void loadFuels()} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Fuel Inventory</h1>
        <p className="mt-1 text-sm leading-relaxed text-gray-500">
          Update stock levels, pricing, and availability
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {fuels.map((fuel) => (
          <FuelStatusCard key={fuel.type} fuel={fuel} onEdit={handleEdit} />
        ))}
      </div>

      {/* Legend */}
      <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-gray-950/[0.06]">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">Stock Level Thresholds</h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
            <span>
              <strong className="font-semibold text-gray-900">Available</strong> — above{' '}
              <span className="font-mono">1,000L</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden />
            <span>
              <strong className="font-semibold text-gray-900">Low Stock</strong> —{' '}
              <span className="font-mono">300L to 1,000L</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden />
            <span>
              <strong className="font-semibold text-gray-900">Critical</strong> — below{' '}
              <span className="font-mono">300L</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
