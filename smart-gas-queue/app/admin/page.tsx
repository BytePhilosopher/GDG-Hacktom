'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, CheckCircle2, Droplets, ArrowRight, Fuel } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminService } from '@/services/adminService';
import { QueueEntry, AdminFuel, StationStats } from '@/types/admin';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getFuelStatus } from '@/lib/fuelStatus';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [fuels, setFuels] = useState<AdminFuel[]>([]);
  const [stats, setStats] = useState<StationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [q, f, s] = await Promise.all([
        adminService.getQueue(),
        adminService.getFuels(),
        adminService.getStats(),
      ]);
      setQueue(q);
      setFuels(f);
      setStats(s);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load dashboard';
      setLoadError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const previewQueue = queue.slice(0, 5);

  if (loading) {
    return <LoadingSpinner className="py-24" text="Loading dashboard…" />;
  }

  if (loadError) {
    return (
      <div className="space-y-6">
        <AdminHeader />
        <div className="mx-auto max-w-lg rounded-2xl bg-red-50 px-6 py-8 text-center ring-1 ring-inset ring-red-600/15">
          <p className="text-sm font-medium leading-relaxed text-red-800">{loadError}</p>
          <Button className="mt-4" onClick={() => void loadDashboard()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="In Queue"
          value={stats?.totalInQueue ?? 0}
          icon={<Users className="h-6 w-6" />}
          color="red"
          subtitle="drivers waiting"
        />
        <StatCard
          label="Completed Today"
          value={stats?.completedToday ?? 0}
          icon={<CheckCircle2 className="h-6 w-6" />}
          color="green"
          subtitle="drivers served"
        />
        <StatCard
          label="Fuel Remaining"
          value={`${(stats?.totalFuelRemaining ?? 0).toLocaleString()}L`}
          icon={<Droplets className="h-6 w-6" />}
          color="yellow"
          subtitle="total across all types"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Queue Preview */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-950/[0.06] lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-950/[0.06] px-5 py-4">
            <h2 className="font-bold tracking-tight text-gray-900">Live Queue — Next 5 Drivers</h2>
            <Link
              href="/admin/queue"
              className="flex items-center gap-1 text-sm font-medium text-red-600 transition-all duration-200 ease-premium hover:gap-1.5 hover:text-red-700"
            >
              View Full Queue
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          {previewQueue.length === 0 ? (
            <div className="py-12 text-center text-sm text-gray-500">Queue is empty</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-950/[0.06] bg-gray-50/80">
                    <th className="w-12 px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      #
                    </th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Name
                    </th>
                    <th className="hidden px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 sm:table-cell">
                      Fuel
                    </th>
                    <th className="px-5 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Liters
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-950/[0.05]">
                  {previewQueue.map((entry) => (
                    <tr
                      key={entry.id}
                      className="transition-colors duration-200 ease-premium hover:bg-primary-50/40"
                    >
                      <td className="px-5 py-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-50 font-mono text-xs font-bold text-primary-600 ring-1 ring-inset ring-primary-600/10">
                          {entry.position}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">{entry.driverName}</td>
                      <td className="hidden px-5 py-3 sm:table-cell">
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
                      <td className="px-5 py-3 font-mono text-gray-600">{entry.liters}L</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Fuel Status */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-950/[0.06]">
          <div className="flex items-center justify-between border-b border-gray-950/[0.06] px-5 py-4">
            <h2 className="font-bold tracking-tight text-gray-900">Fuel Status</h2>
            <Link
              href="/admin/fuel"
              className="text-sm font-medium text-red-600 transition-colors duration-200 ease-premium hover:text-red-700"
            >
              Manage
            </Link>
          </div>
          <div className="space-y-4 px-5 py-4">
            {fuels.map((fuel) => {
              const status = getFuelStatus(fuel.stockLiters);
              return (
                <div key={fuel.type} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 ring-1 ring-inset ring-gray-950/[0.04]">
                    <Fuel className="h-4 w-4 text-gray-500" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-gray-900">{fuel.type}</span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
                          status.badge
                        )}
                      >
                        <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} aria-hidden />
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      <span className="font-mono">{fuel.stockLiters.toLocaleString()}L</span>{' '}
                      remaining
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
