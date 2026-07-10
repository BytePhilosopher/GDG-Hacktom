'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Hide the visible title but keep it for screen readers. */
  hideTitle?: boolean;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * Accessible modal dialog built on Radix Dialog. Provides focus trapping,
 * Escape-to-close, focus restoration, an inert background, and proper
 * `role="dialog"` / `aria-modal` / labelling out of the box.
 */
export function Modal({
  open,
  onOpenChange,
  title,
  hideTitle,
  description,
  children,
  className,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-xl focus:outline-none',
            className
          )}
        >
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            {hideTitle ? (
              <Dialog.Title className="sr-only">{title}</Dialog.Title>
            ) : (
              <Dialog.Title className="text-lg font-semibold text-gray-900">{title}</Dialog.Title>
            )}
            <Dialog.Close
              className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" aria-hidden />
            </Dialog.Close>
          </div>
          {description ? (
            <Dialog.Description className="sr-only">{description}</Dialog.Description>
          ) : null}
          <div className="px-6 py-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
