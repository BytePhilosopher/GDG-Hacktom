'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '@/services/adminService';
import { AdminFuel } from '@/types/admin';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { FuelStatusCard } from '@/components/admin/FuelStatusCard';

export default function AdminFuelPage() {
  const { adminUser } = useAdminAuth();
  const [fuels, setFuels] = useState<AdminFuel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUser) return;
    adminService.getFuels(adminUser.stationId).then((f) => {
      setFuels(f);
      setLoading(false);
    });
  }, [adminUser]);

  const handleEdit = useCallback(
    async (updated: AdminFuel) => {
      // Optimistic update
      setFuels((prev) =>
        prev.map((f) => (f.type === updated.type ? updated : f))
      );
      await adminService.updateFuel(adminUser!.stationId, updated.type, updated);
    },
    [adminUser]
  );

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
            <span>
              <strong className="text-gray-900">Available</strong> — above 1,000L
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>
              <strong className="text-gray-900">Low Stock</strong> — 300L to 1,000L
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>
              <strong className="text-gray-900">Critical</strong> — below 300L
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
