import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

const sizeMap = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function LoadingSpinner({ size = 'md', className, fullScreen, text }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <Loader2 className={cn('animate-spin text-red-600', sizeMap[size], className)} />
        {text && <p className="mt-3 text-gray-600 text-sm">{text}</p>}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <Loader2 className={cn('animate-spin text-red-600', sizeMap[size])} />
      {text && <p className="mt-3 text-gray-600 text-sm">{text}</p>}
    </div>
  );
}
