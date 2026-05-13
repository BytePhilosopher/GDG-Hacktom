'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CreditCard } from 'lucide-react';
import { Fuel } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/utils';

const schema = z.object({
  fuelType: z.string().min(1, 'Please select a fuel type'),
  liters: z
    .number()
    .min(1, 'Minimum 1 liter')
    .max(200, 'Maximum 200 liters'),
});

type FormValues = z.infer<typeof schema>;

interface FuelRequestFormProps {
  fuels: Fuel[];
  onSubmit: (data: { fuelType: string; liters: number; totalPrice: number; advancePayment: number }) => void;
  isLoading?: boolean;
}

export function FuelRequestForm({ fuels, onSubmit, isLoading }: FuelRequestFormProps) {
  const availableFuels = fuels.filter((f) => f.available);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fuelType: availableFuels[0]?.type || '',
      liters: undefined,
    },
  });

  const watchedValues = watch();

  const calculation = useMemo(() => {
    const fuel = fuels.find((f) => f.type === watchedValues.fuelType);
    if (!fuel || !watchedValues.liters || watchedValues.liters <= 0) return null;

    const totalPrice = fuel.pricePerLiter * watchedValues.liters;
    const advancePayment = totalPrice * 0.25;
    return { totalPrice, advancePayment };
  }, [watchedValues.fuelType, watchedValues.liters, fuels]);

  const handleFormSubmit = (data: FormValues) => {
    if (!calculation) return;
    onSubmit({
      fuelType: data.fuelType,
      liters: data.liters,
      totalPrice: calculation.totalPrice,
      advancePayment: calculation.advancePayment,
    });
  };

  return (
    <Card className="mx-4 mt-4 mb-8">
      <CardHeader>
        <h2 className="text-base font-semibold text-gray-900">Your Fuel Request</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
          <Select
            label="Fuel Type"
            placeholder="Select fuel type"
            options={availableFuels.map((f) => ({
              label: `${f.type} — ${f.pricePerLiter} ETB/L`,
              value: f.type,
            }))}
            error={errors.fuelType?.message}
            {...register('fuelType')}
          />

          <Input
            label="Liters Needed"
            type="number"
            min={1}
            max={200}
            placeholder="e.g. 30"
            hint="Enter the amount of fuel you need (1–200 liters)"
            error={errors.liters?.message}
            {...register('liters', { valueAsNumber: true })}
          />

          {calculation && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 border border-gray-200">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total Price</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(calculation.totalPrice)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-900">Advance Payment (25%)</span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Remaining {formatCurrency(calculation.totalPrice - calculation.advancePayment)} paid at station
                  </p>
                </div>
                <span className="text-lg font-bold text-red-600">
                  {formatCurrency(calculation.advancePayment)}
                </span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
            disabled={!calculation || isLoading}
          >
            <CreditCard className="w-5 h-5" />
            Pay {calculation ? formatCurrency(calculation.advancePayment) : ''} & Join Queue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
