'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

function AdminLoadingScreen() {
  return <LoadingSpinner fullScreen text="Loading admin panel..." />;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push('/login'); // not logged in → driver login page
      return;
    }
    if (user.role !== 'station_admin') {
      router.push('/'); // logged in as driver → map page
    }
  }, [user, loading, router]);

  if (loading || !user || user.role !== 'station_admin') {
    return <AdminLoadingScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <AdminSidebar />
      <main className="relative flex-1 overflow-y-auto">
        {/* Subtle brand wash for depth */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-primary-50/40 to-transparent"
          aria-hidden
        />
        {/* Spacer for mobile top bar */}
        <div className="h-14 lg:hidden" />
        <div className="relative mx-auto max-w-6xl p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
