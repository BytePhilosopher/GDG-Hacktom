'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Zap, MapPin } from 'lucide-react';
import { Queue } from '@/types';

interface ActiveQueueCardProps {
  queue: Queue;
}

export function ActiveQueueCard({ queue }: ActiveQueueCardProps) {
  return (
    <div className="mb-6 px-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
        <Zap className="h-4 w-4 text-amber-500" aria-hidden />
        Active Queue
      </h2>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href={`/queue/${queue.id}`}
          className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 p-5 text-white shadow-premium ring-1 ring-white/10 transition-all duration-200 ease-premium group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-y-0">
            <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-red-500/25 blur-3xl" />
            <div className="relative">
              {/* Status + station */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/25">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </span>
                    Active
                  </span>
                  <h3 className="mt-2.5 flex items-center gap-1.5 truncate text-lg font-bold tracking-tight">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" aria-hidden />
                    <span className="truncate">{queue.stationName}</span>
                  </h3>
                  <p className="mt-0.5 text-sm capitalize text-gray-400">
                    {queue.fuelType} · {queue.liters}L
                  </p>
                </div>
                <span className="flex flex-shrink-0 items-center gap-0.5 text-sm font-semibold text-red-400 transition-colors group-hover:text-red-300">
                  View
                  <ChevronRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
                  <p className="text-xs uppercase tracking-widest text-gray-400">Position</p>
                  <p className="mt-1 font-mono text-2xl font-bold text-white">
                    <span className="text-red-400">#</span>
                    {queue.position}
                  </p>
                </div>
                <div className="rounded-xl bg-white/5 px-4 py-3 ring-1 ring-inset ring-white/10">
                  <p className="flex items-center gap-1 text-xs uppercase tracking-widest text-gray-400">
                    <Clock className="h-3 w-3" aria-hidden />
                    Est. Wait
                  </p>
                  <p className="mt-1 font-mono text-2xl font-bold text-white">
                    ~{queue.estimatedWait}
                    <span className="ml-1 text-sm font-medium text-gray-400">min</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}
