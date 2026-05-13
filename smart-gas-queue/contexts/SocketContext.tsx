'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

// Mock socket for demo - replace with real socket.io-client
interface MockSocket {
  emit: (event: string, ...args: unknown[]) => void;
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string) => void;
  connected: boolean;
}

function createMockSocket(): MockSocket {
  const listeners: Record<string, ((...args: unknown[]) => void)[]> = {};

  return {
    connected: true,
    emit: (event: string, ...args: unknown[]) => {
      console.log('[Socket] emit:', event, args);
    },
    on: (event: string, callback: (...args: unknown[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    off: (event: string) => {
      delete listeners[event];
    },
  };
}

const SocketContext = createContext<MockSocket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<MockSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const mockSocket = createMockSocket();
      setSocket(mockSocket);
      return () => {
        setSocket(null);
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
