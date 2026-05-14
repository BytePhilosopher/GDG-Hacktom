'use client';

import { useState, useEffect, useRef } from 'react';
import { QueueEntry } from '@/types/admin';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

export function useAdminQueueRealtime(stationId: string | undefined) {
  const [queue, setQueue]         = useState<QueueEntry[]>([]);
  const [isLive, setIsLive]       = useState(false);
  const channelRef                = useRef<ReturnType<typeof supabase.channel> | null>(null);

  async function fetchQueue() {
    if (!stationId) return;
    const res = await fetch('/api/admin/queue');
    if (res.ok) {
      const data = await res.json();
      setQueue(data);
    }
  }

  useEffect(() => {
    if (!stationId) return;

    fetchQueue();

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
          // Refetch full sorted queue on any change
          fetchQueue();
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
  }, [stationId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { queue, setQueue, isLive, refetch: fetchQueue };
}
