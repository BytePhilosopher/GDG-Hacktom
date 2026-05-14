'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, CreditCard } from 'lucide-react';
import { Queue } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface QueuePositionCardProps {
  queue: Queue;
}

export function QueuePositionCard({ queue }: QueuePositionCardProps) {
  return (
    <div className="space-y-4">
      {/* Position card */}
      <Card className="bg-gradient-to-br from-red-50 to-white border-2 border-red-100">
        <CardContent className="pt-8 pb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div className="text-7xl font-bold text-red-600 mb-1 tabular-nums">
              #{queue.position}
            </div>
            <p className="text-gray-500 text-base font-medium">Your Position in Queue</p>
          </motion.div>

          <div className="w-16 h-px bg-gray-200 mx-auto my-5" />

          <div className="flex items-center justify-center gap-2 text-gray-700">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-xl font-semibold">~{queue.estimatedWait} min</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">Estimated Wait Time</p>
        </CardContent>
      </Card>

      {/* Queue details */}
      <Card>
        <CardContent className="py-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Queue Details</h3>
          <div className="space-y-3">
            <DetailRow
              icon={<MapPin className="w-4 h-4 text-red-500" />}
              label="Station"
              value={queue.stationName ?? 'Unknown Station'}
            />
            <DetailRow
              icon={<span className="text-sm">⛽</span>}
              label="Fuel"
              value={`${queue.fuelType} · ${queue.liters}L`}
            />
            <DetailRow
              icon={<CreditCard className="w-4 h-4 text-emerald-500" />}
              label="Paid"
              value={formatCurrency(queue.paidAmount)}
            />
            <DetailRow
              icon={<CreditCard className="w-4 h-4 text-gray-400" />}
              label="Remaining"
              value={formatCurrency(queue.totalPrice - queue.paidAmount)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 flex items-center justify-between min-w-0">
        <span className="text-sm text-gray-500">{label}</span>
        <span className="text-sm font-medium text-gray-900 truncate ml-2">{value}</span>
      </div>
    </div>
  );
}
