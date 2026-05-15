'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { QueueEntry } from '@/types/admin';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useAdminQueueRealtime(stationId: string | undefined) {
  const [queue, setQueue]         = useState<QueueEntry[]>([]);
  const [isLive, setIsLive]       = useState(false);
  const channelRef                = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchQueue = useCallback(async () => {
    if (!stationId) return;
    const res = await fetch('/api/admin/queue', { credentials: 'include' });
    if (res.ok) {
      const data = (await res.json()) as QueueEntry[];
      setQueue(data);
    } else {
      setQueue([]);
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
          event:  '*',
          schema: 'public',
          table:  'queues',
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

  return { queue, setQueue, isLive, refetch: fetchQueue };
}
