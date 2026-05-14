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
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          Price Breakdown
        </p>
      </div>

      {/* Rows */}
      <div className="bg-white divide-y divide-gray-100">
        <Row label="Fuel Type" value={fuelType} />
        <Row label="Quantity" value={`${liters} L`} />
        <Row label="Price per Liter" value={`${pricePerLiter} ETB`} />
        <Row
          label="Total Cost"
          value={formatCurrency(totalAmount)}
          valueClass="font-semibold text-gray-900"
        />
      </div>

      {/* Advance highlight */}
      <div className="bg-red-50 border-t-2 border-red-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-red-700">Advance Payment (25%)</p>
            <p className="text-xs text-red-500 mt-0.5">Charged now to confirm your spot</p>
          </div>
          <span className="text-xl font-extrabold text-red-600">
            {formatCurrency(advanceAmount)}
          </span>
        </div>
      </div>

      {/* Remaining */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-600">Remaining Balance</p>
        <span className="text-sm font-semibold text-gray-700">
          {formatCurrency(remaining)}
        </span>
      </div>

      {/* Note */}
      <div className="bg-amber-50 border-t border-amber-100 px-4 py-3 flex items-start gap-2">
        <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          You will be charged only <strong>25%</strong> now. The remaining balance of{' '}
          <strong>{formatCurrency(remaining)}</strong> is paid directly at the station when
          you receive your fuel.
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  valueClass = 'text-gray-700',
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm ${valueClass}`}>{value}</span>
    </div>
  );
}
