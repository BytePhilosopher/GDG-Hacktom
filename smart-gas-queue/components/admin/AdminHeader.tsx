'use client';

import { useAuth } from '@/contexts/AuthContext';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function AdminHeader() {
  const { user } = useAuth();

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {getGreeting()}, {user?.fullName?.split(' ')[0] ?? 'Admin'} 👋
      </h1>
      <p className="text-sm text-gray-500 mt-0.5">
        {formatDate()} — {user?.stationName ?? 'Station'}
      </p>
    </div>
  );
}
