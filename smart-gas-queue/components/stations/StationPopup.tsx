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
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-gray-100 safe-area-pb overflow-hidden"
          >
            <motion.div
              className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-6 pb-8 pt-2 max-h-[85vh] overflow-y-auto">
              <div className="relative h-36 -mx-2 mb-4 rounded-2xl overflow-hidden bg-gray-100 shadow-inner">
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
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-600 to-red-900">
                    <Fuel className="w-14 h-14 text-white/90" aria-hidden />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                  <h3 className="text-lg font-bold text-white drop-shadow-sm line-clamp-2 leading-tight">
                    {station.name}
                  </h3>
                  {station.queueSize != null && (
                    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-gray-800 shadow">
                      <Route className="w-3.5 h-3.5 text-red-600" aria-hidden />
                      {station.queueSize} in queue
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start justify-between mb-4 -mt-1">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" aria-hidden />
                    <p className="truncate">{station.location.address}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label="Close popup"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-5 flex-wrap">
                {station.distance != null && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-700 font-medium">
                    <MapPin className="w-4 h-4 text-red-500" aria-hidden />
                    <span>{formatDistance(station.distance)} away</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-700">
                  <Clock className="w-4 h-4 text-emerald-500" aria-hidden />
                  <span>{station.workingHours}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-red-600" aria-hidden />
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
                          <CircleCheck className="w-3.5 h-3.5" aria-hidden />
                        ) : (
                          <CircleX className="w-3.5 h-3.5" aria-hidden />
                        )}
                        {fuel.type}
                        {fuel.available && (
                          <span className="ml-0.5 opacity-80">· {fuel.pricePerLiter} ETB/L</span>
                        )}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <Button
                type="button"
                onClick={() => onJoinQueue(station)}
                className="w-full shadow-lg shadow-red-600/20 group relative overflow-hidden"
                size="lg"
                disabled={!station.fuels.some((f) => f.available)}
              >
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 inline-flex items-center gap-2">
                  <Zap className="w-4 h-4 opacity-90 motion-safe:group-hover:animate-pulse" aria-hidden />
                  Join Queue
                  <ChevronRight className="w-5 h-5 motion-safe:group-hover:translate-x-0.5 transition-transform" aria-hidden />
                </span>
              </Button>

              {!station.fuels.some((f) => f.available) && (
                <p className="text-center text-sm text-gray-500 mt-2">No fuel available at this station</p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
