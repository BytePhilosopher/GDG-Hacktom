'use client';
import React from 'react';
import { CheckCircle, XCircle, Clock, Receipt } from 'lucide-react';
import { Queue } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface RecentActivityListProps {
  items: Queue[];
}

const statusConfig: Record<
  Queue['status'],
  { icon: typeof CheckCircle; color: string; bg: string; ring: string; label: string }
> = {
  completed: {
    icon: CheckCircle,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-600/15',
    label: 'Completed',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50',
    ring: 'ring-red-600/15',
    label: 'Cancelled',
  },
  active: {
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-600/15',
    label: 'Active',
  },
  pending: {
    icon: Clock,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-600/15',
    label: 'Pending',
  },
};

export function RecentActivityList({ items }: RecentActivityListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="px-4">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Recent Activity
        </h2>
        <div className="rounded-2xl bg-white px-6 py-12 text-center shadow-card ring-1 ring-gray-950/[0.06]">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Receipt className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-sm font-semibold text-gray-900">No queue history yet</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Your completed queues will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
        Recent Activity
      </h2>
      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-950/[0.06]">
        {items.map((item, index) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          const date = new Date(item.createdAt).toLocaleDateString('en-ET', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50/80 ${
                index !== 0 ? 'border-t border-gray-950/[0.06]' : ''
              }`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${config.bg} ring-1 ring-inset ${config.ring}`}
              >
                <Icon className={`h-5 w-5 ${config.color}`} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-gray-900">{item.stationName}</p>
                  <span className={`flex-shrink-0 text-xs font-medium ${config.color}`}>
                    {config.label}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs capitalize text-gray-500">
                  {date} · {item.fuelType} · {item.liters}L
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="font-mono text-sm font-semibold text-gray-900">
                  {formatCurrency(item.paidAmount)}
                </p>
                <p className="text-xs text-gray-500">paid</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
