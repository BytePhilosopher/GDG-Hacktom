import React, { Suspense } from 'react';
import Link from 'next/link';
import { Fuel } from 'lucide-react';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Forgot password — FuelQ',
};

export default function ForgotPasswordPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gray-50 p-6">
      {/* Ambient brand bloom */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-brand-radial opacity-[0.06] blur-3xl" />

      <Link
        href="/"
        className="relative z-10 mb-10 flex items-center gap-2.5 transition-colors duration-200 ease-premium hover:opacity-90"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-brand-glow">
          <Fuel className="h-5 w-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight text-gray-900">FuelQ</span>
      </Link>

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 shadow-premium ring-1 ring-gray-950/[0.06] sm:p-10">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Forgot password</h1>
        <p className="mb-8 mt-2 text-sm leading-relaxed text-gray-500">
          Enter your account email and we&apos;ll send you a link to reset your password.
        </p>

        <Suspense
          fallback={
            <div className="flex h-40 items-center justify-center">
              <LoadingSpinner size="sm" />
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
