'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    setServerError('');
    try {
      const user = await login(data);

      // Role-based redirect
      if (user.role === 'station_admin') {
        router.push('/admin');
        return;
      }

      // Driver: honour ?redirect= param (e.g. from join-queue flow), else go to map
      const redirect = searchParams.get('redirect');
      router.push(redirect ?? '/');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        icon={<Mail className="h-4 w-4" />}
        error={errors.email?.message}
        {...register('email')}
      />

      <div>
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter your password"
          autoComplete="current-password"
          icon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          {...register('password')}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors duration-200 ease-premium hover:text-gray-900"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-3.5 w-3.5" aria-hidden />
          ) : (
            <Eye className="h-3.5 w-3.5" aria-hidden />
          )}
          {showPassword ? 'Hide password' : 'Show password'}
        </button>
      </div>

      <div className="flex justify-end">
        <Link href="/forgot-password" className="text-sm font-medium text-red-600 hover:underline">
          Forgot password?
        </Link>
      </div>

      {serverError && (
        <div
          className="rounded-xl bg-red-50 px-4 py-3 ring-1 ring-inset ring-red-600/15"
          role="alert"
        >
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Sign In
      </Button>

      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-red-600 hover:underline">
          Create account
        </Link>
      </p>
    </form>
  );
}
