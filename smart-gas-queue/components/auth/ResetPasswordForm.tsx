'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type Values = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [sessionReady, setSessionReady] = useState<'checking' | 'ok' | 'missing'>('checking');
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) setSessionReady('ok');
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session) setSessionReady('ok');
    });

    const t = window.setTimeout(() => {
      if (cancelled) return;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled) return;
        if (session) setSessionReady('ok');
        else setSessionReady((p) => (p === 'ok' ? 'ok' : 'missing'));
      });
    }, 3500);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.clearTimeout(t);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Values) => {
    setServerError('');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      setServerError(error.message);
      toast.error(error.message);
      return;
    }
    toast.success('Password updated. You can sign in with your new password.');
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (sessionReady === 'checking') {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (sessionReady === 'missing') {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/15">
          <AlertTriangle className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-gray-900">Link expired</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          This reset link is invalid or has expired. Request a new one from the sign-in page.
        </p>
        <Link
          href="/forgot-password"
          className="mt-6 text-sm font-medium text-red-600 transition-colors duration-200 ease-premium hover:text-red-700 hover:underline"
        >
          Request new link
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="New password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm new password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        icon={<Lock className="h-4 w-4" />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition-colors duration-200 ease-premium hover:text-gray-900"
        aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
      >
        {showPassword ? (
          <EyeOff className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Eye className="h-3.5 w-3.5" aria-hidden />
        )}
        {showPassword ? 'Hide passwords' : 'Show passwords'}
      </button>

      {serverError && (
        <div
          className="rounded-xl bg-red-50 px-4 py-3 ring-1 ring-inset ring-red-600/15"
          role="alert"
        >
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Update password
      </Button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-red-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
