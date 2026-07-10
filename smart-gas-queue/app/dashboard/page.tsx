'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Map, History, User } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ActiveQueueCard } from '@/components/dashboard/ActiveQueueCard';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/contexts/AuthContext';
import { queueService } from '@/services/queueService';
import { Queue } from '@/types';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user, logout } = useAuth();
  const [activeQueue, setActiveQueue] = useState<Queue | null>(null);
  const [history, setHistory] = useState<Queue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    Promise.all([queueService.getActiveQueue(), queueService.getHistory()])
      .then(([active, hist]) => {
        setActiveQueue(active);
        setHistory(hist);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <LoadingSpinner fullScreen text="Loading dashboard..." />;
  if (error) {
    return (
      <ErrorState
        fullScreen
        title="Couldn’t load your dashboard"
        message="We couldn’t reach the server. Please check your connection and try again."
        onRetry={load}
      />
    );
  }

  const quickActions = [
    { href: '/', icon: Map, label: 'Find Station', color: 'bg-red-50 text-red-600' },
    {
      href: '/dashboard/history',
      icon: History,
      label: 'History',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      href: '/dashboard/profile',
      icon: User,
      label: 'Profile',
      color: 'bg-purple-50 text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-b border-gray-950/[0.06]">
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient shadow-brand-glow ring-1 ring-white/20">
              <span className="text-sm font-bold text-white">
                {user?.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Welcome back</p>
              <p className="text-sm font-semibold leading-tight text-gray-900">{user?.fullName}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-gray-900/5"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-6 pt-5">
        {/* Active queue */}
        {activeQueue && <ActiveQueueCard queue={activeQueue} />}

        {/* Quick actions */}
        <div className="px-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 rounded-2xl bg-white p-4 shadow-card ring-1 ring-gray-950/[0.06] transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-premium motion-reduce:hover:translate-y-0"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-center text-xs font-semibold text-gray-700">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Vehicle info card */}
        {user?.vehicleInfo && (
          <div className="px-4">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-5 text-white shadow-premium ring-1 ring-white/10">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-red-500/20 blur-2xl" />
              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-widest text-gray-400">
                    My Vehicle
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium capitalize ring-1 ring-inset ring-white/15">
                    {user.vehicleInfo.vehicleType}
                  </span>
                </div>
                <p className="font-mono text-2xl font-bold tracking-[0.2em]">
                  {user.vehicleInfo.plateNumber}
                </p>
                <p className="mt-1 text-sm text-gray-400">
                  License: {user.vehicleInfo.licenseNumber}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent activity */}
        <RecentActivityList items={history} />
      </main>

      <BottomNavigation />
    </div>
  );
}
