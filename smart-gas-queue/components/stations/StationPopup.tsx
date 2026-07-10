'use client';

import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MapPin,
  Clock,
  ChevronRight,
  CircleCheck,
  CircleX,
  Fuel,
  Route,
  Zap,
} from 'lucide-react';
import { Station } from '@/types';
import { formatDistance } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface StationPopupProps {
  station: Station | null;
  onClose: () => void;
  onJoinQueue: (station: Station) => void;
}

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

export function StationPopup({ station, onClose, onJoinQueue }: StationPopupProps) {
  return (
    <AnimatePresence>
      {station && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px]"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 340 }}
            className="safe-area-pb fixed bottom-0 left-0 right-0 z-50 overflow-hidden rounded-t-3xl bg-white shadow-premium ring-1 ring-gray-950/[0.06]"
          >
            <motion.div
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-10 rounded-full bg-gray-200" />
            </div>

            <div className="max-h-[85vh] overflow-y-auto px-6 pb-8 pt-2">
              <div className="relative -mx-2 mb-4 h-36 overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-950/[0.06]">
                {station.imageUrl ? (
                  <Image
                    src={station.imageUrl}
                    alt={`${station.name} station`}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    priority
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-radial">
                    <Fuel className="h-14 w-14 text-white/90" aria-hidden />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <h3 className="line-clamp-2 text-lg font-bold leading-tight tracking-tight text-white drop-shadow-sm">
                    {station.name}
                  </h3>
                  {station.queueSize != null && (
                    <span className="glass inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-gray-900 shadow-float">
                      <Route className="h-3.5 w-3.5 text-primary-600" aria-hidden />
                      <span className="font-mono">{station.queueSize}</span> in queue
                    </span>
                  )}
                </div>
              </div>

              <div className="-mt-1 mb-4 flex items-start justify-between">
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-red-500" aria-hidden />
                    <p className="truncate">{station.location.address}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-shrink-0 rounded-full p-2 text-gray-500 transition-colors duration-200 ease-premium hover:bg-gray-950/[0.05] hover:text-gray-700"
                  aria-label="Close popup"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-2.5">
                {station.distance != null && (
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-sm font-medium text-gray-600 ring-1 ring-inset ring-gray-950/[0.06]">
                    <MapPin className="h-4 w-4 text-primary-500" aria-hidden />
                    <span className="font-mono">{formatDistance(station.distance)}</span> away
                  </div>
                )}
                <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1.5 text-sm text-gray-600 ring-1 ring-inset ring-gray-950/[0.06]">
                  <Clock className="h-4 w-4 text-emerald-500" aria-hidden />
                  <span>{station.workingHours}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <Fuel className="h-4 w-4 text-primary-600" aria-hidden />
                  Fuel types
                </p>
                <motion.div
                  className="flex flex-wrap gap-2"
                  variants={listVariants}
                  initial="hidden"
                  animate="show"
                >
                  {station.fuels.map((fuel) => (
                    <motion.div key={fuel.type} variants={itemVariants}>
                      <Badge variant={fuel.available ? 'success' : 'error'} className="gap-1.5">
                        {fuel.available ? (
                          <CircleCheck className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <CircleX className="h-3.5 w-3.5" aria-hidden />
                        )}
                        {fuel.type}
                        {fuel.available && (
                          <span className="ml-0.5 font-mono opacity-80">
                            · {fuel.pricePerLiter} ETB/L
                          </span>
                        )}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <Button
                type="button"
                onClick={() => onJoinQueue(station)}
                className="group relative w-full overflow-hidden"
                size="lg"
                disabled={!station.fuels.some((f) => f.available)}
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <span className="relative z-10 inline-flex items-center gap-2">
                  <Zap
                    className="h-4 w-4 opacity-90 motion-safe:group-hover:animate-pulse"
                    aria-hidden
                  />
                  Join Queue
                  <ChevronRight
                    className="h-5 w-5 transition-transform motion-safe:group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Button>

              {!station.fuels.some((f) => f.available) && (
                <p className="mt-2 text-center text-sm text-gray-500">
                  No fuel available at this station
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
