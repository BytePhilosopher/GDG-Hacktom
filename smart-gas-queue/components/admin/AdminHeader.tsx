'use client';

import React from 'react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';

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
  const { adminUser } = useAdminAuth();

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {getGreeting()}, {adminUser?.name ?? 'Admin'} 👋
      </h1>
      <p className="text-sm text-gray-500 mt-0.5">
        {formatDate()} — {adminUser?.stationName ?? 'Station'}
      </p>
    </div>
  );
}
