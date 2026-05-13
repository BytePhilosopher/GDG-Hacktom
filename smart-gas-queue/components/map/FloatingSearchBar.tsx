'use client';

import React, { useState } from 'react';
import { Search, X } from 'lucide-react';
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

  const handleSelect = (station: Station) => {
    onStationSelect(station);
    setQuery('');
    setFocused(false);
  };

  return (
    <div className="absolute top-4 left-4 right-16 z-20">
      <div className="relative">
        <div className="flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200 px-4 h-14">
          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder="Search gas stations..."
            className="flex-1 ml-3 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-sm"
            aria-label="Search gas stations"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>

        {focused && filtered.length > 0 && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {filtered.map((station) => (
              <button
                key={station.id}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                onClick={() => handleSelect(station)}
              >
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">⛽</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{station.name}</p>
                  <p className="text-xs text-gray-500 truncate">{station.location.address}</p>
                </div>
                {station.distance != null && (
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-auto">
                    {station.distance} km
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
