'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, ChevronRight, Zap } from 'lucide-react';
import { Queue } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';

interface ActiveQueueCardProps {
  queue: Queue;
}

export function ActiveQueueCard({ queue }: ActiveQueueCardProps) {
  return (
    <div className="px-4 mb-6">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
        <Zap className="w-4 h-4 text-amber-500" />
        Active Queue
      </h2>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="border-2 border-red-100 bg-gradient-to-br from-red-50 to-white">
          <CardContent className="py-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600">Active</span>
                </div>
                <h3 className="font-semibold text-gray-900 truncate">{queue.stationName}</h3>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <span className="font-bold text-red-600">#{queue.position}</span>
                    <span className="text-gray-400">in queue</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    <span>~{queue.estimatedWait} min</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {queue.fuelType} · {queue.liters}L
                </p>
              </div>
              <Link
                href={`/queue/${queue.id}`}
                className="flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700 flex-shrink-0 ml-3"
              >
                View
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
