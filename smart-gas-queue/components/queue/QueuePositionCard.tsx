'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, CreditCard, Users, Fuel } from 'lucide-react';
import { Queue } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface QueuePositionCardProps {
  queue: Queue;
}

export function QueuePositionCard({ queue }: QueuePositionCardProps) {
  const ahead = Math.max(0, queue.position - 1);

  return (
    <div className="space-y-4">
      {/* Position card */}
      <Card className="relative bg-gradient-to-br from-primary-50 via-white to-white">
        {/* Brand accent strip */}
        <div className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" aria-hidden />
        <CardContent className="pb-8 pt-9 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-500">
              Your Position in Queue
            </p>
            <div className="mt-1 flex items-start justify-center">
              <span className="mt-3 text-3xl font-bold text-primary-400/70" aria-hidden>
                #
              </span>
              <span className="text-gradient-brand font-mono text-8xl font-bold tabular-nums leading-none tracking-tight">
                {queue.position}
              </span>
            </div>
          </motion.div>

          {/* Progress feel — people ahead */}
          <div className="mx-auto mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 shadow-soft ring-1 ring-gray-950/[0.06]">
            <Users className="h-3.5 w-3.5 text-primary-500" aria-hidden />
            <span className="text-xs font-medium text-gray-600">
              {ahead === 0 ? (
                <span className="font-semibold text-emerald-600">You&apos;re next</span>
              ) : (
                <>
                  <span className="font-mono font-semibold tabular-nums text-gray-900">
                    {ahead}
                  </span>{' '}
                  ahead of you
                </>
              )}
            </span>
          </div>

          <div className="mx-auto my-6 h-px w-16 bg-gray-950/[0.08]" />

          {/* ETA */}
          <div className="flex items-center justify-center gap-2 text-gray-900">
            <Clock className="h-5 w-5 text-amber-500" aria-hidden />
            <span className="font-mono text-2xl font-bold tabular-nums tracking-tight">
              ~{queue.estimatedWait}
            </span>
            <span className="text-base font-medium text-gray-500">min</span>
          </div>
          <p className="mt-1 text-sm text-gray-500">Estimated wait time</p>
        </CardContent>
      </Card>

      {/* Queue details */}
      <Card>
        <CardContent className="py-5">
          <h3 className="mb-4 text-sm font-bold tracking-tight text-gray-900">Queue Details</h3>
          <div className="space-y-3">
            <DetailRow
              icon={<MapPin className="h-4 w-4 text-primary-500" aria-hidden />}
              label="Station"
              value={queue.stationName ?? 'Unknown Station'}
            />
            <DetailRow
              icon={<Fuel className="h-4 w-4 text-red-600" aria-hidden />}
              label="Fuel"
              value={`${queue.fuelType} · ${queue.liters}L`}
              mono
            />
            <DetailRow
              icon={<CreditCard className="h-4 w-4 text-emerald-500" aria-hidden />}
              label="Paid"
              value={formatCurrency(queue.paidAmount)}
              mono
            />
            <DetailRow
              icon={<CreditCard className="h-4 w-4 text-gray-500" aria-hidden />}
              label="Remaining"
              value={formatCurrency(queue.totalPrice - queue.paidAmount)}
              mono
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
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gray-50 ring-1 ring-gray-950/[0.04]">
        {icon}
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        <span
          className={`ml-2 truncate text-sm font-semibold text-gray-900${mono ? 'font-mono tabular-nums' : ''}`}
        >
          {value}
        </span>
      </div>
    </div>
  );
}
