'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QueueEntry } from '@/types/admin';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useAdminQueueRealtime(stationId: string | undefined) {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchQueue = useCallback(async () => {
    if (!stationId) return;
    setError(false);
    try {
      const res = await fetch('/api/admin/queue', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load queue');
      const data = (await res.json()) as QueueEntry[];
      setQueue(data);
    } catch {
      setQueue([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    if (!stationId) return;

    void fetchQueue();

    const channel = supabase
      .channel(`admin-queue-${stationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queues',
          filter: `station_id=eq.${stationId}`,
        },
        () => {
          void fetchQueue();
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        setIsLive(false);
      }
    };
  }, [stationId, fetchQueue]);

  return { queue, setQueue, isLive, loading, error, refetch: fetchQueue };
}
