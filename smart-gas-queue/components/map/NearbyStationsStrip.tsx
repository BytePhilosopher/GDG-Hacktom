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
        (a, b) =>
          (a.distance ?? Number.POSITIVE_INFINITY) - (b.distance ?? Number.POSITIVE_INFINITY)
      ),
    [stations]
  );

  if (isLoading) {
    return (
      <div className="glass w-full max-w-[min(100vw-2rem,28rem)] rounded-2xl px-4 py-3 shadow-float ring-1 ring-gray-950/[0.06]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-xl bg-gradient-to-br from-primary-100 to-primary-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-32 animate-pulse rounded-full bg-gray-200" />
            <div className="h-2 w-24 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  if (sorted.length === 0) return null;

  return (
    <div className="glass w-full max-w-[min(100vw-2rem,28rem)] overflow-hidden rounded-2xl shadow-float ring-1 ring-gray-950/[0.06]">
      <div className="flex items-center justify-between gap-2 border-b border-gray-950/[0.06] bg-gradient-to-r from-primary-50/60 to-transparent px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-gradient text-white shadow-brand-glow">
            <MapPin className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold leading-tight tracking-tight text-gray-900">
              Nearby stations
            </p>
            <p className="text-[11px] font-medium text-gray-500">
              <span className="font-mono">{sorted.length}</span> within range · nearest first
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-primary-600">
          Tap to focus
        </span>
      </div>

      <div
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto px-2 py-2.5"
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
              transition={{
                delay: Math.min(i * 0.05, 0.35),
                type: 'spring',
                stiffness: 380,
                damping: 28,
              }}
              onClick={() => onSelect(station)}
              className={cn(
                'w-[min(11.5rem,calc(100vw-5rem))] shrink-0 snap-start rounded-xl px-3 py-2.5 text-left ring-1 transition-all duration-200 ease-premium',
                'hover:-translate-y-0.5 hover:shadow-premium motion-reduce:hover:translate-y-0',
                selected
                  ? 'bg-primary-50/90 shadow-card ring-primary-400/50'
                  : 'bg-white/70 ring-gray-950/[0.06] hover:bg-primary-50/50'
              )}
            >
              <div className="flex items-start justify-between gap-1">
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-[11px] font-bold leading-snug tracking-tight text-gray-900">
                    {station.name.replace(/^FuelQ Demo —\s*/, '')}
                  </p>
                  {station.distance != null && (
                    <p className="mt-0.5 font-mono text-[11px] font-semibold text-primary-600">
                      {formatDistance(station.distance)}
                    </p>
                  )}
                </div>
                <ChevronRight
                  className={cn(
                    'mt-0.5 h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-premium',
                    selected ? 'translate-x-0.5 text-primary-600' : 'text-gray-500'
                  )}
                  aria-hidden
                />
              </div>
              <div className="mt-2 flex items-center gap-1.5">
                <Fuel className="h-3 w-3 shrink-0 text-gray-500" aria-hidden />
                <div className="flex flex-wrap gap-0.5">
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
                <span className="ml-auto font-mono text-[11px] tabular-nums text-gray-500">
                  {availableCount}/3
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
