'use client';
import React from 'react';
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
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <span>⛽</span> Available Fuel
        </h2>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Qty (L)
                </th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Price/L
                </th>
              </tr>
            </thead>
            <tbody>
              {fuels.map((fuel, index) => (
                <tr
                  key={fuel.type}
                  className={index < fuels.length - 1 ? 'border-b border-gray-50' : ''}
                >
                  <td className="px-6 py-3 font-medium text-gray-900">{fuel.type}</td>
                  <td className="px-4 py-3">
                    <Badge variant={fuel.available ? 'success' : 'error'}>
                      {fuel.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-600">
                    {fuel.available ? fuel.remainingQuantity.toLocaleString() : '—'}
                  </td>
                  <td className="px-6 py-3 text-right font-semibold text-gray-900">
                    {fuel.pricePerLiter} ETB
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
