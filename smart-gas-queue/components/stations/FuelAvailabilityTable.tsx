'use client';
import React from 'react';
import { Fuel as FuelIcon } from 'lucide-react';
import { Fuel } from '@/types';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface FuelAvailabilityTableProps {
  fuels: Fuel[];
}

export function FuelAvailabilityTable({ fuels }: FuelAvailabilityTableProps) {
  return (
    <Card className="mx-4 mt-4">
      <CardHeader>
        <h2 className="flex items-center gap-2 text-base font-bold tracking-tight text-gray-900">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600 ring-1 ring-inset ring-red-600/10">
            <FuelIcon className="h-4 w-4" aria-hidden />
          </span>
          Available Fuel
        </h2>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-gray-950/[0.06]">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Qty (L)
                </th>
                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                  Price/L
                </th>
              </tr>
            </thead>
            <tbody>
              {fuels.map((fuel, index) => (
                <tr
                  key={fuel.type}
                  className={
                    (index < fuels.length - 1 ? 'border-b border-gray-950/[0.04] ' : '') +
                    'transition-colors duration-200 ease-premium hover:bg-gray-50/70'
                  }
                >
                  <td className="px-6 py-3.5 font-semibold text-gray-900">{fuel.type}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={fuel.available ? 'success' : 'default'}>
                      <span
                        className={
                          'mr-1 h-1.5 w-1.5 rounded-full ' +
                          (fuel.available ? 'bg-emerald-500' : 'bg-gray-400')
                        }
                        aria-hidden
                      />
                      {fuel.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono tabular-nums text-gray-600">
                    {fuel.available ? fuel.remainingQuantity.toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-3.5 text-right font-mono font-semibold tabular-nums text-gray-900">
                    {fuel.pricePerLiter}
                    <span className="ml-1 text-xs font-normal text-gray-500">ETB</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
