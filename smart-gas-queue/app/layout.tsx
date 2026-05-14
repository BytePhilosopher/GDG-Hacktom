import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { ToastProvider } from '@/components/ui/ToastProvider';

export const metadata: Metadata = {
  title: 'FuelQ — Smart Gas Station Queue',
  description: 'Join fuel queues digitally, pay 25% in advance via Chapa, and track your position in real-time.',
};

export const viewport: Viewport = {
  themeColor: '#DC2626',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 text-gray-900" style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif" }}>
        <AuthProvider>
          <SocketProvider>
            {children}
            <ToastProvider />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
