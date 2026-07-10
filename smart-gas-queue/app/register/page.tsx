import React from 'react';
import Link from 'next/link';
import { Fuel, ArrowLeft, Zap, CreditCard, Bell } from 'lucide-react';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create Account — FuelQ',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="relative hidden flex-col justify-center overflow-hidden bg-brand-radial p-12 md:sticky md:top-0 md:flex md:h-screen md:w-1/2 md:self-start">
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

        <div className="relative z-10 mx-auto max-w-sm">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/15 shadow-2xl ring-1 ring-white/25 backdrop-blur-sm">
            <Fuel className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-3 text-4xl font-bold tracking-tight text-white">Join FuelQ today</h1>
          <p className="max-w-xs text-lg leading-relaxed text-red-50/90">
            Create your account in minutes and never wait in a fuel line again.
          </p>

          <ul className="mt-10 space-y-4">
            {[
              { icon: Zap, title: 'Reserve your spot', desc: 'Join any station queue digitally' },
              {
                icon: CreditCard,
                title: 'Pay in advance',
                desc: 'Lock your place with 25% upfront',
              },
              { icon: Bell, title: 'Stay informed', desc: 'Live updates on your position' },
            ].map((item) => (
              <li
                key={item.title}
                className="flex items-start gap-3 rounded-2xl bg-white/10 p-4 ring-1 ring-inset ring-white/15 backdrop-blur-sm transition-colors hover:bg-white/[0.14]"
              >
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-inset ring-white/25 backdrop-blur-sm">
                  <item.icon className="h-5 w-5 text-white" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-red-50/70">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 flex-col bg-white px-6 py-8 md:px-12 md:py-12">
        <div className="mx-auto w-full max-w-md">
          {/* Back to login */}
          <Link
            href="/login"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors duration-200 ease-premium hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to sign in
          </Link>

          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient shadow-brand-glow">
              <Fuel className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">FuelQ</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Create your account</h2>
            <p className="mt-1.5 leading-relaxed text-gray-500">
              Join thousands of drivers saving time at fuel stations.
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
