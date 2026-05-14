import React, { Suspense } from 'react';
import { Fuel } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign In — FuelQ',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-red-600 to-red-800 flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white"
              style={{
                width: `${(i + 1) * 120}px`,
                height: `${(i + 1) * 120}px`,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Fuel className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">FuelQ</h1>
          <p className="text-red-100 text-lg max-w-xs leading-relaxed">
            Smart fuel queue management. Skip the wait, pay in advance.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 text-left">
            {[
              { emoji: '📍', title: 'Find Stations', desc: 'Locate nearby fuel stations on the map' },
              { emoji: '⚡', title: 'Join Queue', desc: 'Reserve your spot digitally' },
              { emoji: '💳', title: 'Pay Advance', desc: 'Secure your place with 25% payment' },
              { emoji: '🔔', title: 'Get Notified', desc: 'Real-time updates on your position' },
            ].map((item) => (
              <div key={item.title} className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl mb-2">{item.emoji}</div>
                <p className="text-white font-semibold text-sm">{item.title}</p>
                <p className="text-red-200 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 md:hidden">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
              <Fuel className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FuelQ</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 mt-1">Sign in to manage your fuel queues</p>
          </div>

          <Suspense fallback={<div className="h-48 flex items-center justify-center"><div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin" /></div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
