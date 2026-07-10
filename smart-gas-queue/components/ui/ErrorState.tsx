'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  className?: string;
}

/**
 * Consistent error + retry surface for failed data loads. Use instead of
 * silently rendering an empty state when a fetch fails.
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'We couldn’t load this. Please check your connection and try again.',
  onRetry,
  fullScreen,
  className,
}: ErrorStateProps) {
  const content = (
    <div
      role="alert"
      className={cn('flex flex-col items-center justify-center px-6 text-center', className)}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-6 w-6 text-red-600" aria-hidden />
      </div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-gray-600">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">{content}</div>
    );
  }
  return <div className="py-12">{content}</div>;
}
