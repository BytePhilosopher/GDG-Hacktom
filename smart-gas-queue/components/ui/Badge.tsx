'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700 ring-gray-600/10',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/15',
  warning: 'bg-amber-50 text-amber-700 ring-amber-600/15',
  error: 'bg-red-50 text-red-700 ring-red-600/15',
  info: 'bg-blue-50 text-blue-700 ring-blue-600/15',
};

export function Badge({ children, className, variant = 'default', icon, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icon && <span className="h-3 w-3">{icon}</span>}
      {children}
    </span>
  );
}
