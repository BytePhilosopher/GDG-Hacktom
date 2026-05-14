'use client';

import { useState, useEffect } from 'react';
import { Queue } from '@/types';
import api from '@/lib/axios';
import { useSocket } from '@/contexts/SocketContext';

export function useQueuePosition(queueId: string) {
  const [queue, setQueue]   = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    if (!queueId) return;

    // Fetch from real API
    api
      .get<Queue>(`/queue/position/${queueId}`)
      .then((res) => {
        setQueue(res.data as Queue);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    // Simulate position advancing every 15 s (replace with socket events in production)
    const interval = setInterval(() => {
      setQueue((prev) => {
        if (!prev || prev.position <= 1) return prev;
        return {
          ...prev,
          position:      Math.max(1, prev.position - 1),
          estimatedWait: Math.max(0, prev.estimatedWait - 7),
        };
      });
    }, 15000);

    if (socket) socket.emit('join-queue-room', queueId);

    return () => {
      clearInterval(interval);
      if (socket) socket.emit('leave-queue-room', queueId);
    };
  }, [queueId, socket]);

  return { queue, loading };
}
