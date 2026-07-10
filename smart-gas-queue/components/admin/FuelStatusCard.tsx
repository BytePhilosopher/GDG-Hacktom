'use client';

import React, { useState } from 'react';
import { Fuel, Pencil } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AdminFuel } from '@/types/admin';
import { cn } from '@/lib/utils';
import { getFuelStatus } from '@/lib/fuelStatus';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

interface FuelStatusCardProps {
  fuel: AdminFuel;
  onEdit: (fuel: AdminFuel) => Promise<void>;
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

  async function onSubmit(data: EditForm) {
    try {
      await onEdit({
        ...fuel,
        stockLiters: Number(data.stockLiters),
        pricePerLiter: Number(data.pricePerLiter),
        available: data.available === 'available',
      });
      setModalOpen(false);
    } catch {
      /* parent shows toast and rolls back */
    }
  }

  return (
    <>
      <div className="group rounded-2xl bg-white p-5 shadow-card ring-1 ring-gray-950/[0.06] transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-premium motion-reduce:hover:translate-y-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 ring-1 ring-inset ring-gray-950/[0.04]">
              <Fuel className="h-5 w-5 text-gray-600" aria-hidden />
            </div>
            <div>
              <h3 className="font-bold tracking-tight text-gray-900">{fuel.type}</h3>
              <span
                className={cn(
                  'mt-1 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
                  status.badge
                )}
              >
                <span className={cn('h-1.5 w-1.5 rounded-full', status.dot)} aria-hidden />
                {status.label}
              </span>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-gray-500 transition-all duration-200 ease-premium hover:bg-red-50 hover:text-red-600"
          >
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-inset ring-gray-950/[0.04]">
            <p className="text-xs text-gray-500">Stock</p>
            <p className="mt-0.5 font-mono text-lg font-bold text-gray-900">
              {fuel.stockLiters.toLocaleString()}
              <span className="ml-1 text-sm font-normal text-gray-500">L</span>
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-3 ring-1 ring-inset ring-gray-950/[0.04]">
            <p className="text-xs text-gray-500">Price</p>
            <p className="mt-0.5 font-mono text-lg font-bold text-gray-900">
              {fuel.pricePerLiter}
              <span className="ml-1 text-sm font-normal text-gray-500">ETB/L</span>
            </p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        open={modalOpen}
        onOpenChange={setModalOpen}
        title={`Edit ${fuel.type}`}
        description={`Update stock, price, and availability for ${fuel.type}.`}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <fieldset>
            <legend className="mb-2 block text-sm font-medium text-gray-700">Availability</legend>
            <div className="flex gap-4">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  value="available"
                  {...register('available')}
                  className="accent-red-600"
                />
                <span className="text-sm text-gray-700">Available</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  value="unavailable"
                  {...register('available')}
                  className="accent-red-600"
                />
                <span className="text-sm text-gray-700">Unavailable</span>
              </label>
            </div>
          </fieldset>

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
      </Modal>
    </>
  );
}
