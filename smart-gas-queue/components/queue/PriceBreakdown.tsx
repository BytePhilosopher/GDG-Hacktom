'use client';
import React from 'react';
import { Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface PriceBreakdownProps {
  fuelType: string;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  advanceAmount: number;
}

export function PriceBreakdown({
  fuelType,
  liters,
  pricePerLiter,
  totalAmount,
  advanceAmount,
}: PriceBreakdownProps) {
  const remaining = totalAmount - advanceAmount;

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-950/[0.06]">
      {/* Header */}
      <div className="border-b border-gray-950/[0.06] px-4 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Price Breakdown
        </p>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-950/[0.04]">
        <Row label="Fuel Type" value={fuelType} />
        <Row label="Quantity" value={`${liters} L`} mono />
        <Row label="Price per Liter" value={`${pricePerLiter} ETB`} mono />
        <Row
          label="Total Cost"
          value={formatCurrency(totalAmount)}
          mono
          valueClass="font-semibold text-gray-900"
        />
      </div>

      {/* Advance highlight */}
      <div className="relative overflow-hidden border-t border-red-100 bg-gradient-to-br from-primary-50 to-white px-4 py-4">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-brand-gradient"
          aria-hidden
        />
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-primary-700">Advance Payment</p>
              <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                25%
              </span>
            </div>
            <p className="mt-0.5 text-xs text-primary-500">Charged now to confirm your spot</p>
          </div>
          <span className="font-mono text-2xl font-bold tabular-nums tracking-tight text-primary-600">
            {formatCurrency(advanceAmount)}
          </span>
        </div>
      </div>

      {/* Remaining */}
      <div className="flex items-center justify-between border-t border-gray-950/[0.06] px-4 py-3">
        <p className="text-sm text-gray-600">Remaining Balance</p>
        <span className="font-mono text-sm font-semibold tabular-nums text-gray-700">
          {formatCurrency(remaining)}
        </span>
      </div>

      {/* Note */}
      <div className="flex items-start gap-2.5 border-t border-amber-100 bg-amber-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500" aria-hidden />
        <p className="text-xs leading-relaxed text-amber-700">
          You will be charged only <strong className="font-semibold">25%</strong> now. The remaining
          balance of <strong className="font-semibold">{formatCurrency(remaining)}</strong> is paid
          directly at the station when you receive your fuel.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = 'text-gray-700',
  mono = false,
}: {
  label: string;
  value: string;
  valueClass?: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono tabular-nums' : ''}${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
