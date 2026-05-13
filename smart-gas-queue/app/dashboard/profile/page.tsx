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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors -ml-2"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="font-semibold text-gray-900">My Profile</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-6 space-y-5">
        {/* Avatar */}
        <div className="flex flex-col items-center py-4">
          <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-3">
            <span className="text-white text-3xl font-bold">
              {user.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user.fullName}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>

        {/* Personal info */}
        <Card>
          <CardContent className="py-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Personal Information
            </h3>
            <div className="space-y-4">
              <InfoRow icon={<User className="w-4 h-4" />} label="Full Name" value={user.fullName} />
              <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={user.phone} />
              <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={user.email} />
            </div>
          </CardContent>
        </Card>

        {/* Vehicle info */}
        <Card>
          <CardContent className="py-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Vehicle Details
            </h3>
            <div className="space-y-4">
              <InfoRow
                icon={<Hash className="w-4 h-4" />}
                label="Plate Number"
                value={user.vehicleInfo.plateNumber}
              />
              <InfoRow
                icon={<Car className="w-4 h-4" />}
                label="Vehicle Type"
                value={user.vehicleInfo.vehicleType.charAt(0).toUpperCase() + user.vehicleInfo.vehicleType.slice(1)}
              />
              <InfoRow
                icon={<Hash className="w-4 h-4" />}
                label="License Number"
                value={user.vehicleInfo.licenseNumber}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sign out */}
        <Button
          variant="danger"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </main>

      <BottomNavigation />
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">{value}</p>
      </div>
    </div>
  );
}
