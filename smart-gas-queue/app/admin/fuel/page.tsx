'use client';

import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';
import { AdminFuel } from '@/types/admin';
import { FuelStatusCard } from '@/components/admin/FuelStatusCard';

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
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fuel Inventory</h1>
          <p className="text-sm text-gray-500 mt-0.5">Update stock levels, pricing, and availability</p>
        </div>
        <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-8 text-center max-w-lg">
          <p className="text-red-800 text-sm font-medium">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadFuels()}
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Fuel Inventory</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Update stock levels, pricing, and availability
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {fuels.map((fuel) => (
          <FuelStatusCard key={fuel.type} fuel={fuel} onEdit={handleEdit} />
        ))}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Stock Level Thresholds</h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span><strong className="text-gray-900">Available</strong> — above 1,000L</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span><strong className="text-gray-900">Low Stock</strong> — 300L to 1,000L</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span><strong className="text-gray-900">Critical</strong> — below 300L</span>
          </div>
        </div>
      </div>
    </div>
  );
}
