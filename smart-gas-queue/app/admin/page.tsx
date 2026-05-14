'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, CheckCircle2, Droplets, ArrowRight, Fuel } from 'lucide-react';
import { adminService } from '@/services/adminService';
import { QueueEntry, AdminFuel, StationStats } from '@/types/admin';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

function getFuelStatus(stockLiters: number) {
  if (stockLiters > 1000) return { label: 'Available', variant: 'success' as const, dot: 'bg-emerald-500' };
  if (stockLiters > 300) return { label: 'Low Stock', variant: 'warning' as const, dot: 'bg-amber-500' };
  return { label: 'Critical', variant: 'error' as const, dot: 'bg-red-500' };
}

export default function AdminDashboardPage() {
  const { adminUser } = useAdminAuth();
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [fuels, setFuels] = useState<AdminFuel[]>([]);
  const [stats, setStats] = useState<StationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminUser) return;
    async function load() {
      try {
        const [q, f, s] = await Promise.all([
          adminService.getQueue(adminUser!.stationId),
          adminService.getFuels(adminUser!.stationId),
          adminService.getStats(adminUser!.stationId),
        ]);
        setQueue(q);
        setFuels(f);
        setStats(s);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [adminUser]);

  const previewQueue = queue.slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="In Queue"
          value={stats?.totalInQueue ?? 0}
          icon={<Users className="w-6 h-6" />}
          color="red"
          subtitle="drivers waiting"
        />
        <StatCard
          label="Completed Today"
          value={stats?.completedToday ?? 0}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
          subtitle="drivers served"
        />
        <StatCard
          label="Fuel Remaining"
          value={`${(stats?.totalFuelRemaining ?? 0).toLocaleString()}L`}
          icon={<Droplets className="w-6 h-6" />}
          color="yellow"
          subtitle="total across all types"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Queue Preview */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Live Queue — Next 5 Drivers</h2>
            <Link
              href="/admin/queue"
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              View Full Queue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {previewQueue.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">Queue is empty</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">#</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Fuel</th>
                  <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Liters</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {previewQueue.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="w-6 h-6 rounded-full bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center">
                        {entry.position}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{entry.driverName}</td>
                    <td className="px-5 py-3 hidden sm:table-cell">
                      <Badge
                        variant={
                          entry.fuelType === 'Benzene'
                            ? 'success'
                            : entry.fuelType === 'Diesel'
                            ? 'info'
                            : 'warning'
                        }
                      >
                        {entry.fuelType}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{entry.liters}L</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Fuel Status */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Fuel Status</h2>
            <Link
              href="/admin/fuel"
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Manage
            </Link>
          </div>
          <div className="px-5 py-4 space-y-4">
            {fuels.map((fuel) => {
              const status = getFuelStatus(fuel.stockLiters);
              return (
                <div key={fuel.type} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Fuel className="w-4 h-4 text-gray-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900">{fuel.type}</span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full',
                          status.variant === 'success' && 'bg-emerald-50 text-emerald-700',
                          status.variant === 'warning' && 'bg-amber-50 text-amber-700',
                          status.variant === 'error' && 'bg-red-50 text-red-700'
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                        {status.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {fuel.stockLiters.toLocaleString()}L remaining
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
