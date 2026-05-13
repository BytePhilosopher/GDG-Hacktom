'use client';

import { useState, useEffect } from 'react';
import { Queue } from '@/types';
import { queueService } from '@/services/queueService';
import { useSocket } from '@/contexts/SocketContext';

export function useQueuePosition(queueId: string) {
  const [queue, setQueue] = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  useEffect(() => {
    if (!queueId) return;

    // Initial fetch
    queueService.getQueuePosition(queueId).then((data) => {
      setQueue(data);
      setLoading(false);
    });

    // Simulate real-time position updates
    const interval = setInterval(() => {
      setQueue((prev) => {
        if (!prev || prev.position <= 1) return prev;
        return {
          ...prev,
          position: Math.max(1, prev.position - 1),
          estimatedWait: Math.max(0, prev.estimatedWait - 3),
        };
      });
    }, 15000);

    if (socket) {
      socket.emit('join-queue-room', queueId);
    }

    return () => {
      clearInterval(interval);
      if (socket) {
        socket.emit('leave-queue-room', queueId);
      }
    };
  }, [queueId, socket]);

  return { queue, loading };
}
