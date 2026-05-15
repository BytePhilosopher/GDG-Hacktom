import React, { Suspense } from 'react';
import Link from 'next/link';
import { Fuel } from 'lucide-react';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot password — FuelQ',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <Link href="/" className="flex items-center gap-2 mb-10 text-gray-900 hover:text-red-600 transition-colors">
        <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
          <Fuel className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold">FuelQ</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password</h1>
        <p className="text-gray-500 text-sm mt-1 mb-6">
          Enter your account email and we&apos;ll send you a link to reset your password.
        </p>

        <Suspense
          fallback={
            <div className="h-40 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <ForgotPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
