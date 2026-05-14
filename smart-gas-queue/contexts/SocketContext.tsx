'use client';

/**
 * SocketContext — now backed by Supabase Realtime instead of socket.io.
 * Kept as a context so existing consumers (useSocket) don't break.
 * The `connected` flag reflects the Supabase Realtime connection state.
 */

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

interface RealtimeSocket {
  connected: boolean;
  /** No-op — kept for API compatibility. Real events come via useQueuePosition / useAdminQueueRealtime. */
  emit: (event: string, ...args: unknown[]) => void;
  on:   (event: string, callback: (...args: unknown[]) => void) => void;
  off:  (event: string) => void;
}

const SocketContext = createContext<RealtimeSocket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user }                  = useAuth();
  const [connected, setConnected] = useState(false);
  const supabaseRef               = useRef(createClient());

  useEffect(() => {
    if (!user) {
      setConnected(false);
      return;
    }

    // Open a presence channel to track connection state
    const channel = supabaseRef.current
      .channel('presence-heartbeat')
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabaseRef.current.removeChannel(channel);
      setConnected(false);
    };
  }, [user]);

  const socket: RealtimeSocket = {
    connected,
    emit: (event, ...args) => {
      // No-op — Supabase Realtime is subscription-based, not emit-based
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Realtime] emit (no-op):', event, args);
      }
    },
    on:  () => { /* subscriptions handled by dedicated hooks */ },
    off: () => { /* subscriptions handled by dedicated hooks */ },
  };

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
