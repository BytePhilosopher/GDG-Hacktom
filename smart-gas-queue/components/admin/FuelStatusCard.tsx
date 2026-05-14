'use client';

import React, { useState } from 'react';
import { Fuel, Pencil, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminFuel } from '@/types/admin';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface FuelStatusCardProps {
  fuel: AdminFuel;
  onEdit: (fuel: AdminFuel) => void;
}

function getFuelStatus(stockLiters: number): {
  label: string;
  dot: string;
  badge: string;
} {
  if (stockLiters > 1000)
    return { label: 'Available', dot: 'bg-emerald-500', badge: 'text-emerald-700 bg-emerald-50' };
  if (stockLiters > 300)
    return { label: 'Low Stock', dot: 'bg-amber-500', badge: 'text-amber-700 bg-amber-50' };
  return { label: 'Critical', dot: 'bg-red-500', badge: 'text-red-700 bg-red-50' };
}

// Keep form values as strings — coerce to numbers in onSubmit
const editSchema = z.object({
  stockLiters: z
    .string()
    .min(1, 'Required')
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, 'Must be 0 or more'),
  pricePerLiter: z
    .string()
    .min(1, 'Required')
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 1, 'Must be at least 1'),
  available: z.enum(['available', 'unavailable']),
});

type EditForm = z.infer<typeof editSchema>;

export function FuelStatusCard({ fuel, onEdit }: FuelStatusCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const status = getFuelStatus(fuel.stockLiters);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditForm>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      stockLiters: String(fuel.stockLiters),
      pricePerLiter: String(fuel.pricePerLiter),
      available: fuel.available ? 'available' : 'unavailable',
    },
  });

  function openModal() {
    reset({
      stockLiters: String(fuel.stockLiters),
      pricePerLiter: String(fuel.pricePerLiter),
      available: fuel.available ? 'available' : 'unavailable',
    });
    setModalOpen(true);
  }

  function onSubmit(data: EditForm) {
    onEdit({
      ...fuel,
      stockLiters: Number(data.stockLiters),
      pricePerLiter: Number(data.pricePerLiter),
      available: data.available === 'available',
    });
    setModalOpen(false);
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Fuel className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{fuel.type}</h3>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full mt-1',
                  status.badge
                )}
              >
                <span className={cn('w-1.5 h-1.5 rounded-full', status.dot)} />
                {status.label}
              </span>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
          >
            <Pencil className="w-4 h-4" />
            Edit
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Stock</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {fuel.stockLiters.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 ml-1">L</span>
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-xs text-gray-500">Price</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">
              {fuel.pricePerLiter}
              <span className="text-sm font-normal text-gray-500 ml-1">ETB/L</span>
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Edit {fuel.type}</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4">
              <Input
                label="Stock (Liters)"
                type="number"
                error={errors.stockLiters?.message}
                {...register('stockLiters')}
              />
              <Input
                label="Price per Liter (ETB)"
                type="number"
                error={errors.pricePerLiter?.message}
                {...register('pricePerLiter')}
              />

              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Availability</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="available"
                      {...register('available')}
                      className="accent-red-600"
                    />
                    <span className="text-sm text-gray-700">Available</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="unavailable"
                      {...register('available')}
                      className="accent-red-600"
                    />
                    <span className="text-sm text-gray-700">Unavailable</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" isLoading={isSubmitting}>
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
