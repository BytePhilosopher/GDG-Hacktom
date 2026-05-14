'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Gauge, ArrowLeft } from 'lucide-react';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const adminLoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof adminLoginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const { adminUser, login } = useAdminAuth();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(adminLoginSchema),
  });

  useEffect(() => {
    if (adminUser) router.replace('/admin');
  }, [adminUser, router]);

  async function onSubmit(data: LoginForm) {
    try {
      await login(data.email, data.password);
      router.push('/admin');
    } catch {
      setError('root', { message: 'Invalid email or password' });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-red-600 to-red-500" />

          <div className="px-8 py-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-md shadow-red-200">
                <Gauge className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Station Admin</h1>
              <p className="text-sm text-gray-500 mt-1">Smart Gas Queue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="Station ID or Email"
                type="email"
                placeholder="admin@station.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />

              {errors.root && (
                <p className="text-sm text-red-600 text-center bg-red-50 rounded-lg py-2 px-3">
                  {errors.root.message}
                </p>
              )}

              <Button type="submit" className="w-full mt-2" isLoading={isSubmitting}>
                Sign In →
              </Button>
            </form>

            {/* Hint */}
            <p className="text-xs text-gray-400 text-center mt-4">
              Demo: admin@totalstation.com / admin123
            </p>
          </div>
        </div>

        {/* Back link */}
        <div className="text-center mt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Driver App
          </Link>
        </div>
      </div>
    </div>
  );
}
