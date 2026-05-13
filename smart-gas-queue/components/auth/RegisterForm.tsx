'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Phone, Mail, Lock, Car, Hash } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Name must be at least 3 characters'),
    phone: z
      .string()
      .regex(/^(\+251|0)[79]\d{8}$/, 'Invalid Ethiopian phone number (e.g. 0912345678)'),
    email: z.string().email('Invalid email address'),
    plateNumber: z.string().min(4, 'Invalid plate number'),
    vehicleType: z.enum(['sedan', 'suv', 'truck', 'motorcycle', 'van'] as const).refine(
      (val) => ['sedan', 'suv', 'truck', 'motorcycle', 'van'].includes(val),
      { message: 'Please select a vehicle type' }
    ),
    licenseNumber: z.string().min(5, 'Invalid license number'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterValues = z.infer<typeof registerSchema>;

const VEHICLE_OPTIONS = [
  { label: 'Sedan', value: 'sedan' },
  { label: 'SUV', value: 'suv' },
  { label: 'Truck', value: 'truck' },
  { label: 'Motorcycle', value: 'motorcycle' },
  { label: 'Van', value: 'van' },
];

export function RegisterForm() {
  const { register: registerUser } = useAuth();
  const router = useRouter();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterValues) => {
    setServerError('');
    try {
      await registerUser(data);
      router.push('/dashboard');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Personal Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Personal Information
        </h3>
        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Abebe Kebede"
            autoComplete="name"
            icon={<User className="w-4 h-4" />}
            error={errors.fullName?.message}
            {...register('fullName')}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="0912345678"
            autoComplete="tel"
            icon={<Phone className="w-4 h-4" />}
            hint="Ethiopian phone number format"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
        </div>
      </div>

      {/* Vehicle Info */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 pt-2">
          Vehicle Details
        </h3>
        <div className="space-y-4">
          <Input
            label="Plate Number"
            placeholder="AA-12345"
            icon={<Hash className="w-4 h-4" />}
            error={errors.plateNumber?.message}
            {...register('plateNumber')}
          />
          <Select
            label="Vehicle Type"
            placeholder="Select vehicle type"
            options={VEHICLE_OPTIONS}
            error={errors.vehicleType?.message}
            {...register('vehicleType')}
          />
          <Input
            label="License Number"
            placeholder="LIC-98765"
            icon={<Car className="w-4 h-4" />}
            error={errors.licenseNumber?.message}
            {...register('licenseNumber')}
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 pt-2">
          Security
        </h3>
        <div className="space-y-4">
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            icon={<Lock className="w-4 h-4" />}
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>
      </div>

      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3" role="alert">
          <p className="text-sm text-red-700">{serverError}</p>
        </div>
      )}

      <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
        Create Account
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link href="/login" className="text-red-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
