'use client';
import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold tracking-[-0.01em] transition-all duration-200 ease-premium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] motion-reduce:active:scale-100',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-gradient text-white shadow-brand-glow hover:brightness-[1.06] hover:shadow-[0_10px_28px_-6px_rgba(220,38,38,0.5)] focus-visible:ring-red-500',
        secondary:
          'bg-white text-gray-900 shadow-soft ring-1 ring-gray-200 hover:bg-gray-50 hover:ring-gray-300 focus-visible:ring-gray-400',
        outline:
          'border border-red-200 text-red-700 bg-white hover:bg-red-50 hover:border-red-300 focus-visible:ring-red-500',
        ghost: 'text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-400',
        danger:
          'bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100 focus-visible:ring-red-400',
        success:
          'bg-emerald-600 text-white shadow-soft hover:bg-emerald-700 focus-visible:ring-emerald-500',
        chapa:
          'bg-gradient-to-b from-green-500 to-green-600 text-white shadow-[0_8px_24px_-6px_rgba(22,163,74,0.45)] hover:brightness-[1.05] focus-visible:ring-green-500',
      },
      size: {
        sm: 'h-9 px-4 text-sm gap-1.5',
        md: 'h-11 px-6 text-[15px] gap-2',
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
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({ className, variant, size, isLoading, children, ...props }: ButtonProps) {
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
