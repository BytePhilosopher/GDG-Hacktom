'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Station } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface StationPopupProps {
  station: Station | null;
  onClose: () => void;
  onJoinQueue: (station: Station) => void;
}

export function StationPopup({ station, onClose, onJoinQueue }: StationPopupProps) {
  return (
    <AnimatePresence>
      {station && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/20"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="px-6 pb-8 pt-2">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-gray-900 truncate">{station.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <p className="text-sm text-gray-500 truncate">{station.location.address}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="ml-3 p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                  aria-label="Close popup"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Info row */}
              <div className="flex items-center gap-4 mb-5">
                {station.distance != null && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span>{station.distance} km away</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Clock className="w-4 h-4 text-emerald-500" />
                  <span>{station.workingHours}</span>
                </div>
              </div>

              {/* Fuel types */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-700 mb-2">Available Fuel Types</p>
                <div className="flex flex-wrap gap-2">
                  {station.fuels.map((fuel) => (
                    <Badge
                      key={fuel.type}
                      variant={fuel.available ? 'success' : 'error'}
                    >
                      {fuel.available ? '🟢' : '🔴'} {fuel.type}
                      {fuel.available && (
                        <span className="ml-1 opacity-70">· {fuel.pricePerLiter} ETB/L</span>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={() => onJoinQueue(station)}
                className="w-full"
                size="lg"
                disabled={!station.fuels.some((f) => f.available)}
              >
                Join Queue
                <ChevronRight className="w-5 h-5" />
              </Button>

              {!station.fuels.some((f) => f.available) && (
                <p className="text-center text-sm text-gray-500 mt-2">
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
