import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Queue } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface RecentActivityListProps {
  items: Queue[];
}

const statusConfig = {
  completed: { icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-50', label: 'Cancelled' },
  active: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Active' },
  pending: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Pending' },
};

export function RecentActivityList({ items }: RecentActivityListProps) {
  if (!items || items.length === 0) {
    return (
      <div className="px-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Recent Activity
        </h2>
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-gray-400 text-sm">No queue history yet</p>
            <p className="text-gray-300 text-xs mt-1">Your completed queues will appear here</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Recent Activity
      </h2>
      <div className="space-y-3">
        {items.map((item) => {
          const config = statusConfig[item.status];
          const Icon = config.icon;
          const date = new Date(item.createdAt).toLocaleDateString('en-ET', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <Card key={item.id}>
              <CardContent className="py-4">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-4 h-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.stationName}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {date} · {item.fuelType} {item.liters}L
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(item.paidAmount)}
                        </p>
                        <p className="text-xs text-gray-400">paid</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
