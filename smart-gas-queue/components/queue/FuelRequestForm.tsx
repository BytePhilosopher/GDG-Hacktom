'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Fuel } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { PriceBreakdown } from '@/components/queue/PriceBreakdown';

const schema = z.object({
  fuelType: z.string().min(1, 'Please select a fuel type'),
  liters:   z.number().min(1, 'Minimum 1 liter').max(200, 'Maximum 200 liters'),
});

type FormValues = z.infer<typeof schema>;

interface FuelRequestFormProps {
  fuels:      Fuel[];
  onSubmit:   (data: { fuelType: string; liters: number; totalPrice: number; advancePayment: number }) => void;
  isLoading?: boolean;
}

export function FuelRequestForm({ fuels, onSubmit, isLoading }: FuelRequestFormProps) {
  const available = fuels.filter((f) => f.available);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fuelType: available[0]?.type ?? '', liters: undefined },
  });

  const { fuelType, liters } = watch();

  const calc = useMemo(() => {
    const fuel = fuels.find((f) => f.type === fuelType);
    if (!fuel || !liters || liters <= 0) return null;
    const totalPrice     = fuel.pricePerLiter * liters;
    const advancePayment = Math.round(totalPrice * 0.25 * 100) / 100;
    return { totalPrice, advancePayment, pricePerLiter: fuel.pricePerLiter };
  }, [fuelType, liters, fuels]);

  const handleFormSubmit = (data: FormValues) => {
    if (!calc) return;
    onSubmit({ fuelType: data.fuelType, liters: data.liters,
               totalPrice: calc.totalPrice, advancePayment: calc.advancePayment });
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
            options={available.map((f) => ({
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

          {calc && fuelType && liters > 0 && (
            <PriceBreakdown
              fuelType={fuelType}
              liters={liters}
              pricePerLiter={calc.pricePerLiter}
              totalAmount={calc.totalPrice}
              advanceAmount={calc.advancePayment}
            />
          )}

          <button
            type="submit"
            disabled={!calc || isLoading}
            className="w-full h-14 flex items-center justify-center gap-2 rounded-xl text-white text-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            style={{ backgroundColor: '#2ECC71' }}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connecting to Chapa…
              </>
            ) : (
              <>
                <span>💳</span>
                Pay {calc ? `${calc.advancePayment.toLocaleString('en-ET')} ETB` : ''} via Chapa
              </>
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  );
}
