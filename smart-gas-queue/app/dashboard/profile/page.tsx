'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, Car, Hash, LogOut } from 'lucide-react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { BottomNavigation } from '@/components/dashboard/BottomNavigation';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="glass sticky top-0 z-10 border-b border-gray-950/[0.06]">
        <div className="mx-auto flex h-14 max-w-lg items-center gap-3 px-4">
          <Link
            href="/dashboard"
            className="-ml-2 rounded-full p-2 transition-colors hover:bg-gray-900/5"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" aria-hidden />
          </Link>
          <h1 className="font-bold tracking-tight text-gray-900">My Profile</h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-5 px-4 pt-6">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-brand-gradient shadow-brand-glow ring-1 ring-white/20">
            <span className="text-4xl font-bold text-white">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">{user.fullName}</h2>
          <p className="mt-0.5 text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Personal info */}
        <Card>
          <CardContent className="py-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Personal Information
            </h3>
            <div className="space-y-4">
              <InfoRow
                icon={<User className="h-4 w-4" />}
                label="Full Name"
                value={user.fullName}
              />
              <InfoRow icon={<Phone className="h-4 w-4" />} label="Phone" value={user.phone} />
              <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle info — only shown for drivers */}
        {user.vehicleInfo && (
          <Card>
            <CardContent className="py-5">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Vehicle Details
              </h3>
              <div className="space-y-4">
                <InfoRow
                  icon={<Hash className="h-4 w-4" />}
                  label="Plate Number"
                  value={user.vehicleInfo.plateNumber}
                />
                <InfoRow
                  icon={<Car className="h-4 w-4" />}
                  label="Vehicle Type"
                  value={
                    user.vehicleInfo.vehicleType.charAt(0).toUpperCase() +
                    user.vehicleInfo.vehicleType.slice(1)
                  }
                />
                <InfoRow
                  icon={<Hash className="h-4 w-4" />}
                  label="License Number"
                  value={user.vehicleInfo.licenseNumber}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sign out */}
        <Button variant="danger" className="w-full" onClick={handleLogout}>
          <LogOut className="h-4 w-4" aria-hidden />
          Sign Out
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500 ring-1 ring-inset ring-gray-950/[0.04]">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="truncate text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
