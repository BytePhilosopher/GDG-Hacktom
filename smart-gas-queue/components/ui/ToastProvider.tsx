'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '12px',
          background: '#1F2937',
          color: '#fff',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#10B981', secondary: '#fff' },
        },
        error: {
          iconTheme: { primary: '#DC2626', secondary: '#fff' },
          duration: 6000,
        },
      }}
    />
  );
}
