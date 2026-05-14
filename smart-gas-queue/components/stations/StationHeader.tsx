'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Share2, MapPin, Clock } from 'lucide-react';
import { Station } from '@/types';

interface StationHeaderProps {
  station: Station;
}

export function StationHeader({ station }: StationHeaderProps) {
  return (
    <div className="relative">
      {/* Banner image */}
      <div className="relative h-48 bg-gradient-to-br from-red-600 to-red-800 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <span className="text-9xl">⛽</span>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Nav buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <Link
            href="/"
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <button
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
            aria-label="Share station"
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: station.name, url: window.location.href });
              }
            }}
          >
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Station name overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <h1 className="text-2xl font-bold text-white">{station.name}</h1>
          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{station.location.address}</span>
            </div>
            <div className="flex items-center gap-1 text-white/80 text-sm">
              <Clock className="w-3.5 h-3.5" />
              <span>{station.workingHours}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
