import React from 'react';
import Link from 'next/link';
import { Fuel, ArrowLeft } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account — FuelQ',
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-3">
          <Link
            href="/login"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors -ml-2"
            aria-label="Back to login"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-red-600 rounded-lg flex items-center justify-center">
              <Fuel className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">FuelQ</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 pb-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1">Join thousands of drivers saving time at fuel stations</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <RegisterForm />
        </div>
      </main>
    </div>
  );
}
