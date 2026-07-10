'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Mail, MailCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  email: z.string().email('Invalid email address'),
});

type Values = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

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
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const redirectTo = `${origin}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(data.email, { redirectTo });

    if (error) {
      setServerError(error.message);
      toast.error(error.message);
      return;
    }

    setSent(true);
    toast.success('If an account exists for that email, you will receive a reset link shortly.');
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-inset ring-emerald-600/15">
          <MailCheck className="h-7 w-7" aria-hidden />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-gray-900">Check your inbox</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Check your inbox (and spam folder) for an email from us with a link to set a new password.
        </p>
        <Link
          href="/login"
          className="mt-6 text-sm font-medium text-red-600 transition-colors duration-200 ease-premium hover:text-red-700 hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

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

      {serverError && (
        <div
          className="rounded-xl bg-red-50 px-4 py-3 ring-1 ring-inset ring-red-600/15"
          role="alert"
        >
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Send reset link
      </Button>

      <p className="text-center text-sm text-gray-600">
        <Link href="/login" className="font-medium text-red-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
