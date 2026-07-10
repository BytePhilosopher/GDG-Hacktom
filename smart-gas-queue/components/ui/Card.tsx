'use client';
import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** Adds a subtle lift on hover — use for interactive/clickable cards. */
  interactive?: boolean;
}
interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export function Card({ children, className, interactive, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-gray-950/[0.06]',
        interactive &&
          'transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-premium motion-reduce:hover:translate-y-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: CardSectionProps) {
  return (
    <div className={cn('border-b border-gray-950/[0.06] px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardContent({ children, className, ...props }: CardSectionProps) {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: CardSectionProps) {
  return (
    <div
      className={cn('border-t border-gray-950/[0.06] bg-gray-50/80 px-6 py-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}
