'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Fuel, MapPinOff, Search, X } from 'lucide-react';
import { Station } from '@/types';

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
    <div className="absolute top-4 left-4 right-[5.25rem] z-20 sm:right-24">
      <motion.div
        className="relative"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/80 px-3 sm:px-4 h-14 ring-1 ring-black/[0.03] focus-within:ring-red-500/20 focus-within:border-red-200 transition-shadow">
          <Search className="w-5 h-5 text-red-500/80 flex-shrink-0" aria-hidden />
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
            className="flex-1 ml-3 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm min-w-0"
            aria-label="Search gas stations"
            aria-expanded={showResults}
            aria-controls="station-search-results"
            aria-autocomplete="list"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors shrink-0"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
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
              className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-200/90 overflow-hidden max-h-[min(60vh,320px)] overflow-y-auto"
            >
              {!hasMatches && (
                <div className="flex items-center gap-3 px-4 py-6 text-center justify-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <MapPinOff className="h-5 w-5" aria-hidden />
                  </div>
                  <p className="text-sm text-slate-600">No stations match that search.</p>
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
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50/80 active:bg-red-50 transition-colors text-left border-b border-gray-50 last:border-0"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(station)}
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Fuel className="w-4 h-4 text-white" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-900 truncate">{station.name}</p>
                    <p className="text-xs text-gray-500 truncate">{station.location.address}</p>
                  </div>
                  {station.distance != null && (
                    <span className="text-xs font-medium text-red-600 bg-red-50 px-2 py-1 rounded-lg flex-shrink-0">
                      {station.distance} km
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
