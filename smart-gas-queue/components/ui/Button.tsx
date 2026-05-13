import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none',
  {
    variants: {
      variant: {
        primary: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-400',
        outline: 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
        danger: 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-400',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
      },
      size: {
        sm: 'h-9 px-4 text-sm gap-1.5',
        md: 'h-11 px-6 text-base gap-2',
        lg: 'h-14 px-8 text-lg gap-2',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  isLoading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}
