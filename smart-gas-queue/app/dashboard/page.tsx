'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, LogOut, Map, History, User } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { ActiveQueueCard } from '@/components/dashboard/ActiveQueueCard';
import { RecentActivityList } from '@/components/dashboard/RecentActivityList';
import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
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

  useEffect(() => {
    Promise.all([queueService.getActiveQueue(), queueService.getHistory()])
      .then(([active, hist]) => {
        setActiveQueue(active);
        setHistory(hist);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullScreen text="Loading dashboard..." />;

  const quickActions = [
    { href: '/', icon: Map, label: 'Find Station', color: 'bg-red-50 text-red-600' },
    { href: '/dashboard/history', icon: History, label: 'History', color: 'bg-blue-50 text-blue-600' },
    { href: '/dashboard/profile', icon: User, label: 'Profile', color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Welcome back</p>
              <p className="font-semibold text-gray-900 text-sm leading-tight">
                {user?.fullName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={logout}
              className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto pt-5 space-y-6">
        {/* Active queue */}
        {activeQueue && <ActiveQueueCard queue={activeQueue} />}

        {/* Quick actions */}
        <div className="px-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(({ href, icon: Icon, label, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-2 bg-white rounded-2xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Vehicle info card */}
        {user?.vehicleInfo && (
          <div className="px-4">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-5 text-white">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400 uppercase tracking-wide">My Vehicle</span>
                <span className="text-xs bg-white/10 px-2 py-1 rounded-full capitalize">
                  {user.vehicleInfo.vehicleType}
                </span>
              </div>
              <p className="text-2xl font-bold tracking-wider">{user.vehicleInfo.plateNumber}</p>
              <p className="text-sm text-gray-400 mt-1">License: {user.vehicleInfo.licenseNumber}</p>
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
