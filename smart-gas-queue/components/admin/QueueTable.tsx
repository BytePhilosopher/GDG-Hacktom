'use client';

import React, { useState } from 'react';
import { CheckCircle2, SkipForward, Trash2, X, Wifi, WifiOff } from 'lucide-react';
import { QueueEntry } from '@/types/admin';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Live Queue
            <span className="ml-2 text-gray-500 font-normal text-base">
              — {entries.length} driver{entries.length !== 1 ? 's' : ''} waiting
            </span>
          </h2>
        </div>
        <div
          className={cn(
            'flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full',
            isLive
              ? 'bg-red-50 text-red-600'
              : 'bg-gray-100 text-gray-500'
          )}
        >
          {isLive ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              LIVE
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              OFFLINE
            </>
          )}
        </div>
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-10">
                #
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Driver
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Plate
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Fuel
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Liters
              </th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  No drivers in queue
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="w-7 h-7 rounded-full bg-red-50 text-red-600 text-xs font-bold flex items-center justify-center">
                      {entry.position}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{entry.driverName}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{entry.plateNumber}</td>
                  <td className="px-4 py-3">
                    <Badge variant={fuelBadgeVariant[entry.fuelType] ?? 'default'}>
                      {entry.fuelType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{entry.liters}L</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onComplete(entry.id)}
                        title="Mark as completed"
                        className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                        aria-label="Complete"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSkip(entry.id)}
                        title="Skip to end"
                        className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                        aria-label="Skip"
                      >
                        <SkipForward className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setRemoveTarget(entry)}
                        title="Remove from queue"
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
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
      <div className="md:hidden space-y-3">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">
            No drivers in queue
          </div>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {entry.position}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">{entry.driverName}</p>
                    <p className="text-xs text-gray-500 font-mono">{entry.plateNumber}</p>
                  </div>
                </div>
                <Badge variant={fuelBadgeVariant[entry.fuelType] ?? 'default'}>
                  {entry.fuelType}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-gray-600">{entry.liters}L requested</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onComplete(entry.id)}
                    className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                    aria-label="Complete"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSkip(entry.id)}
                    className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors"
                    aria-label="Skip"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRemoveTarget(entry)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Remove Confirmation Modal */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Remove from Queue?</h2>
              <button
                onClick={() => setRemoveTarget(null)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="px-6 py-5">
              <p className="font-semibold text-gray-900">
                {removeTarget.driverName}{' '}
                <span className="font-mono text-sm text-gray-500">
                  ({removeTarget.plateNumber})
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-0.5">
                {removeTarget.fuelType} • {removeTarget.liters}L
              </p>
              <p className="text-sm text-gray-600 mt-3">
                This will cancel their queue request and notify them.
              </p>
              <div className="flex gap-3 mt-5">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setRemoveTarget(null)}
                >
                  Cancel
                </Button>
                <Button variant="danger" className="flex-1" onClick={confirmRemove}>
                  Yes, Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
