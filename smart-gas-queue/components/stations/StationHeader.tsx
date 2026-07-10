'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, MapPin, Clock, Fuel } from 'lucide-react';
import { Station } from '@/types';
import { shareOrCopy } from '@/lib/share';

interface StationHeaderProps {
  station: Station;
}

export function StationHeader({ station }: StationHeaderProps) {
  return (
    <div className="relative">
      {/* Banner */}
      <div className="relative h-56 overflow-hidden bg-brand-radial">
        {/* Oversized decorative mark */}
        <div className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 select-none opacity-[0.14]">
          <Fuel className="h-40 w-40 text-white" aria-hidden strokeWidth={1.5} />
        </div>
        {/* Soft light bloom + legibility scrim */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_-20%,rgba(255,255,255,0.28),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        {/* Nav buttons */}
        <div className="absolute left-4 right-4 top-4 flex items-center justify-between">
          <Link
            href="/"
            className="glass flex h-10 w-10 items-center justify-center rounded-full text-white shadow-soft transition-all duration-200 ease-premium hover:bg-white/30 active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </Link>
          <button
            className="glass flex h-10 w-10 items-center justify-center rounded-full text-white shadow-soft transition-all duration-200 ease-premium hover:bg-white/30 active:scale-95"
            aria-label="Share station"
            onClick={() => void shareOrCopy({ title: station.name, url: window.location.href })}
          >
            <Share2 className="h-5 w-5" aria-hidden />
          </button>
        </div>

        {/* Station name overlay */}
        <div className="absolute bottom-5 left-4 right-4">
          <h1 className="text-3xl font-bold tracking-tight text-white drop-shadow-sm">
            {station.name}
          </h1>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white">
              <MapPin className="h-3.5 w-3.5" aria-hidden />
              <span className="truncate">{station.location.address}</span>
            </span>
            <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-white">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              <span>{station.workingHours}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
