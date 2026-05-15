'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Fuel, MapPin } from 'lucide-react';
import { Station } from '@/types';
import { cn, formatDistance } from '@/lib/utils';

interface NearbyStationsStripProps {
  stations: Station[];
  isLoading?: boolean;
  selectedId?: string | null;
  onSelect: (station: Station) => void;
}

export function NearbyStationsStrip({
  stations,
  isLoading,
  selectedId,
  onSelect,
}: NearbyStationsStripProps) {
  const sorted = useMemo(
    () =>
      [...stations].sort(
        (a, b) => (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY)
      ),
    [stations]
  );

  if (isLoading) {
    return (
      <div className="w-full max-w-[min(100vw-2rem,28rem)] rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-md shadow-lg px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-red-100 to-red-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-2 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (sorted.length === 0) return null;

  return (
    <div className="w-full max-w-[min(100vw-2rem,28rem)] rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-md shadow-lg overflow-hidden ring-1 ring-black/[0.03]">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-gray-100/90 bg-gradient-to-r from-red-50/50 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-red-600 to-red-800 text-white shadow-sm">
            <MapPin className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 leading-tight truncate">Nearby stations</p>
            <p className="text-[10px] text-slate-500 font-medium">
              {sorted.length} within range · nearest first
            </p>
          </div>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-red-600/90 shrink-0">
          Tap to focus
        </span>
      </div>

      <div
        className="flex gap-2 overflow-x-auto px-2 py-2.5 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
        role="list"
        aria-label="Nearby stations"
      >
        {sorted.map((station, i) => {
          const selected = station.id === selectedId;
          const availableCount = station.fuels.filter((f) => f.available).length;
          return (
            <motion.button
              key={station.id}
              type="button"
              role="listitem"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.35), type: 'spring', stiffness: 380, damping: 28 }}
              onClick={() => onSelect(station)}
              className={cn(
                'snap-start shrink-0 w-[min(11.5rem,calc(100vw-5rem))] rounded-xl border px-3 py-2.5 text-left transition-all',
                'hover:border-red-300 hover:bg-red-50/60 active:scale-[0.98]',
                selected
                  ? 'border-red-400 bg-red-50/90 shadow-md ring-1 ring-red-200/60'
                  : 'border-gray-100 bg-white/90'
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold text-slate-900 leading-snug line-clamp-2">
                    {station.name.replace(/^FuelQ Demo —\s*/, '')}
                  </p>
                  {station.distance != null && (
                    <p className="text-[10px] font-semibold text-red-600 mt-0.5">
                      {formatDistance(station.distance)}
                    </p>
                  )}
                </div>
                <ChevronRight
                  className={cn(
                    'w-3.5 h-3.5 shrink-0 mt-0.5 transition-transform',
                    selected ? 'text-red-600 translate-x-0.5' : 'text-gray-300'
                  )}
                  aria-hidden
                />
              </div>
              <div className="flex items-center gap-1 mt-2">
                <Fuel className="w-3 h-3 text-gray-400 shrink-0" aria-hidden />
                <div className="flex gap-0.5 flex-wrap">
                  {station.fuels.map((f) => (
                    <span
                      key={f.type}
                      title={`${f.type}${f.available ? '' : ' (unavailable)'}`}
                      className={cn(
                        'h-1.5 w-6 rounded-full',
                        f.available ? 'bg-emerald-500' : 'bg-gray-200'
                      )}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 ml-auto tabular-nums">{availableCount}/3</span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
