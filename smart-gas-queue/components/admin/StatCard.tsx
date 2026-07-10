import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'red' | 'green' | 'yellow' | 'gray';
  subtitle?: string;
}

const colorMap = {
  red: {
    icon: 'bg-red-50 text-red-600 ring-red-600/10',
    accent: 'from-red-500/60',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600 ring-emerald-600/10',
    accent: 'from-emerald-500/60',
  },
  yellow: {
    icon: 'bg-amber-50 text-amber-600 ring-amber-600/10',
    accent: 'from-amber-500/60',
  },
  gray: {
    icon: 'bg-gray-100 text-gray-600 ring-gray-600/10',
    accent: 'from-gray-400/60',
  },
};

export function StatCard({ label, value, icon, color = 'gray', subtitle }: StatCardProps) {
  const styles = colorMap[color];

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-card ring-1 ring-gray-950/[0.06] transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-premium motion-reduce:hover:translate-y-0">
      {/* Top accent line */}
      <div
        className={cn(
          'absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent',
          styles.accent
        )}
        aria-hidden
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-2 font-mono text-3xl font-bold tracking-tight text-gray-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
        <div
          className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ring-1 transition-transform duration-200 ease-premium group-hover:scale-105',
            styles.icon
          )}
          aria-hidden
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
