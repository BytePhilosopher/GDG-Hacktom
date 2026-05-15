'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (sessionReady === 'missing') {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-gray-600">
          This reset link is invalid or has expired. Request a new one from the sign-in page.
        </p>
        <Link href="/forgot-password" className="inline-block text-sm text-red-600 font-medium hover:underline">
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
        icon={<Lock className="w-4 h-4" />}
        error={errors.password?.message}
        {...register('password')}
      />
      <Input
        label="Confirm new password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        icon={<Lock className="w-4 h-4" />}
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
        aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
      >
        {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        {showPassword ? 'Hide' : 'Show'} passwords
      </button>

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Update password
      </Button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="text-red-600 font-medium hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
