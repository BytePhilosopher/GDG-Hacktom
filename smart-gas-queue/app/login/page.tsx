import React, { Suspense } from 'react';
import { Fuel, MapPin, Zap, CreditCard, Bell } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const metadata = {
  title: 'Sign In — FuelQ',
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="relative hidden flex-col items-center justify-center overflow-hidden bg-brand-radial p-12 md:flex md:w-1/2">
        {/* Concentric rings */}
        <div className="absolute inset-0 opacity-[0.12]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border border-white"
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
        {/* Soft light bloom */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-black/20 blur-3xl" />

        <div className="relative z-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/15 shadow-2xl ring-1 ring-white/25 backdrop-blur-sm">
            <Fuel className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-3 text-5xl font-bold tracking-tight text-white">FuelQ</h1>
          <p className="mx-auto max-w-xs text-lg leading-relaxed text-red-50/90">
            Smart fuel queue management. Skip the wait, pay in advance.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3 text-left">
            {[
              {
                icon: MapPin,
                title: 'Find Stations',
                desc: 'Locate nearby fuel stations on the map',
              },
              { icon: Zap, title: 'Join Queue', desc: 'Reserve your spot digitally' },
              {
                icon: CreditCard,
                title: 'Pay Advance',
                desc: 'Secure your place with 25% payment',
              },
              { icon: Bell, title: 'Get Notified', desc: 'Real-time updates on your position' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl bg-white/10 p-4 ring-1 ring-inset ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/[0.14]"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                  <item.icon className="h-5 w-5 text-white" aria-hidden />
                </div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-red-50/70">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-brand-glow">
              <Fuel className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">FuelQ</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back</h2>
            <p className="mt-1.5 text-gray-500">Sign in to manage your fuel queues</p>
          </div>

          <Suspense
            fallback={
              <div className="flex h-48 items-center justify-center">
                <LoadingSpinner size="sm" />
              </div>
            }
          >
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
