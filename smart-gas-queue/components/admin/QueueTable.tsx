'use client';

import React, { useState } from 'react';
import { CheckCircle2, SkipForward, Trash2, WifiOff } from 'lucide-react';
import { QueueEntry } from '@/types/admin';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';

interface QueueTableProps {
  entries: QueueEntry[];
  onComplete: (id: string) => void;
  onSkip: (id: string) => void;
  onRemove: (id: string) => void;
  isLive?: boolean;
}

const fuelBadgeVariant: Record<string, 'success' | 'info' | 'warning'> = {
  Benzene: 'success',
  Diesel: 'info',
  Kerosene: 'warning',
};

export function QueueTable({
  entries,
  onComplete,
  onSkip,
  onRemove,
  isLive = false,
}: QueueTableProps) {
  const [removeTarget, setRemoveTarget] = useState<QueueEntry | null>(null);

  function confirmRemove() {
    if (removeTarget) {
      onRemove(removeTarget.id);
      setRemoveTarget(null);
    }
  }

  return (
    <>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-gray-900">
            Live Queue
            <span className="ml-2 text-base font-normal text-gray-500">
              — <span className="font-mono font-semibold text-gray-600">{entries.length}</span>{' '}
              driver{entries.length !== 1 ? 's' : ''} waiting
            </span>
          </h2>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
            isLive
              ? 'bg-red-50 text-red-600 ring-red-600/15'
              : 'bg-gray-100 text-gray-500 ring-gray-600/10'
          )}
        >
          {isLive ? (
            <>
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
              </span>
              LIVE
            </>
          ) : (
            <>
              <WifiOff className="h-3.5 w-3.5" aria-hidden />
              OFFLINE
            </>
          )}
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden overflow-x-auto rounded-2xl bg-white shadow-card ring-1 ring-gray-950/[0.06] md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-950/[0.06] bg-gray-50/80">
              <th className="w-12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Driver
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Plate
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Fuel
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Liters
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-950/[0.05]">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-sm text-gray-500">
                  No drivers in queue
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr
                  key={entry.id}
                  className="transition-colors duration-200 ease-premium hover:bg-primary-50/40"
                >
                  <td className="px-4 py-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-50 font-mono text-xs font-bold text-primary-600 ring-1 ring-inset ring-primary-600/10">
                      {entry.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{entry.driverName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{entry.plateNumber}</td>
                  <td className="px-4 py-3">
                    <Badge variant={fuelBadgeVariant[entry.fuelType] ?? 'default'}>
                      {entry.fuelType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-700">{entry.liters}L</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onComplete(entry.id)}
                        title="Mark as completed"
                        className="rounded-lg p-2 text-emerald-600 transition-all duration-200 ease-premium hover:bg-emerald-50"
                        aria-label="Complete"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        onClick={() => onSkip(entry.id)}
                        title="Skip to end"
                        className="rounded-lg p-2 text-amber-600 transition-all duration-200 ease-premium hover:bg-amber-50"
                        aria-label="Skip"
                      >
                        <SkipForward className="h-4 w-4" aria-hidden />
                      </button>
                      <button
                        onClick={() => setRemoveTarget(entry)}
                        title="Remove from queue"
                        className="rounded-lg p-2 text-red-500 transition-all duration-200 ease-premium hover:bg-red-50"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="space-y-3 md:hidden">
        {entries.length === 0 ? (
          <div className="rounded-2xl bg-white py-12 text-center text-sm text-gray-500 shadow-card ring-1 ring-gray-950/[0.06]">
            No drivers in queue
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-gray-950/[0.06] transition-all duration-200 ease-premium"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-50 font-mono text-sm font-bold text-primary-600 ring-1 ring-inset ring-primary-600/10">
                    {entry.position}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{entry.driverName}</p>
                    <p className="font-mono text-xs text-gray-500">{entry.plateNumber}</p>
                  </div>
                </div>
                <Badge variant={fuelBadgeVariant[entry.fuelType] ?? 'default'}>
                  {entry.fuelType}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-gray-950/[0.05] pt-3">
                <span className="text-sm text-gray-600">
                  <span className="font-mono font-medium text-gray-900">{entry.liters}L</span>{' '}
                  requested
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onComplete(entry.id)}
                    className="rounded-lg p-2 text-emerald-600 transition-all duration-200 ease-premium hover:bg-emerald-50"
                    aria-label="Complete"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    onClick={() => onSkip(entry.id)}
                    className="rounded-lg p-2 text-amber-600 transition-all duration-200 ease-premium hover:bg-amber-50"
                    aria-label="Skip"
                  >
                    <SkipForward className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    onClick={() => setRemoveTarget(entry)}
                    className="rounded-lg p-2 text-red-500 transition-all duration-200 ease-premium hover:bg-red-50"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Remove Confirmation Modal */}
      <Modal
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove from Queue?"
        description="Confirm removing this driver from the live queue."
      >
        {removeTarget && (
          <>
            <p className="font-semibold text-gray-900">
              {removeTarget.driverName}{' '}
              <span className="font-mono text-sm text-gray-500">({removeTarget.plateNumber})</span>
            </p>
            <p className="mt-0.5 text-sm text-gray-500">
              {removeTarget.fuelType} • {removeTarget.liters}L
            </p>
            <p className="mt-3 text-sm text-gray-600">
              This will cancel their queue request and notify them.
            </p>
            <div className="mt-5 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setRemoveTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" className="flex-1" onClick={confirmRemove}>
                Yes, Remove
              </Button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
