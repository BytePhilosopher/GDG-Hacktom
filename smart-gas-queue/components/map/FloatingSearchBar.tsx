'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Fuel, MapPinOff, Search, X } from 'lucide-react';
import { Station } from '@/types';
import { formatDistance } from '@/lib/utils';

interface FloatingSearchBarProps {
  stations: Station[];
  onStationSelect: (station: Station) => void;
}

export function FloatingSearchBar({ stations, onStationSelect }: FloatingSearchBarProps) {
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const filtered = query.trim()
    ? stations.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.location.address.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const trimmed = query.trim();
  const showResults = focused && trimmed.length > 0;
  const hasMatches = filtered.length > 0;

  const handleSelect = (station: Station) => {
    onStationSelect(station);
    setQuery('');
    setFocused(false);
  };

  return (
    <div className="absolute left-4 right-[5.25rem] top-4 z-20 sm:right-24">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <div className="glass flex h-14 items-center rounded-2xl px-3 shadow-float ring-1 ring-gray-950/[0.06] transition-all duration-200 ease-premium focus-within:shadow-premium focus-within:ring-primary-500/25 sm:px-4">
          <Search className="h-5 w-5 flex-shrink-0 text-primary-500" aria-hidden />
          <input
            type="text"
            role="combobox"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={(e) => {
              const next = e.relatedTarget as Node | null;
              if (next && e.currentTarget.parentElement?.parentElement?.contains(next)) return;
              setFocused(false);
            }}
            placeholder="Search gas stations…"
            className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500"
            aria-label="Search gas stations"
            aria-expanded={showResults}
            aria-controls="station-search-results"
            aria-autocomplete="list"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="shrink-0 rounded-full p-1.5 text-gray-500 transition-colors duration-200 ease-premium hover:bg-gray-950/[0.05] hover:text-gray-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <AnimatePresence>
          {showResults && (
            <motion.div
              id="station-search-results"
              role="listbox"
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="glass absolute left-0 right-0 top-full mt-2 max-h-[min(60vh,320px)] overflow-hidden overflow-y-auto rounded-2xl p-1.5 shadow-premium ring-1 ring-gray-950/[0.06]"
            >
              {!hasMatches && (
                <div className="flex items-center justify-center gap-3 px-4 py-6 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    <MapPinOff className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="text-sm text-gray-600">No stations match that search.</p>
                </div>
              )}
              {filtered.map((station, i) => (
                <motion.button
                  key={station.id}
                  type="button"
                  role="option"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ease-premium hover:bg-primary-50/80 active:bg-primary-50"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(station)}
                >
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-gradient shadow-soft">
                    <Fuel className="h-4 w-4 text-white" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-gray-900">{station.name}</p>
                    <p className="truncate text-xs text-gray-500">{station.location.address}</p>
                  </div>
                  {station.distance != null && (
                    <span className="flex-shrink-0 rounded-full bg-primary-50 px-2.5 py-1 font-mono text-xs font-semibold text-primary-600 ring-1 ring-inset ring-primary-600/15">
                      {formatDistance(station.distance)}
                    </span>
                  )}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
