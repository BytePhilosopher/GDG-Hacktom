'use client';

import { useState, useEffect, useRef } from 'react';
import { Queue } from '@/types';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

 
function toQueue(raw: any): Queue {
  return {
    id:             raw.id,
    driverId:       raw.driver_id,
    stationId:      raw.station_id,
    stationName:    raw.stations?.name,
    fuelType:       raw.fuel_type,
    liters:         raw.liters,
    totalPrice:     raw.total_price,
    advancePayment: raw.advance_payment,
    paidAmount:     raw.paid_amount,
    position:       raw.position,
    estimatedWait:  raw.estimated_wait,
    status:         raw.status,
    paymentStatus:  raw.payment_status,
    createdAt:      raw.created_at,
    updatedAt:      raw.updated_at,
  };
}

export function useQueuePosition(queueId: string) {
  const [queue, setQueue]     = useState<Queue | null>(null);
  const [loading, setLoading] = useState(true);
  const channelRef            = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!queueId) return;

    // Initial fetch
    supabase
      .from('queues')
      .select('*, stations(name)')
      .eq('id', queueId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) setQueue(toQueue(data));
        setLoading(false);
      });

    // Subscribe to real-time updates on this queue row
    const channel = supabase
      .channel(`queue-pos-${queueId}`)
      .on(
        'postgres_changes',
        {
          event:  'UPDATE',
          schema: 'public',
          table:  'queues',
          filter: `id=eq.${queueId}`,
        },
        (payload) => {
          setQueue((prev) =>
            prev ? { ...prev, ...toQueue({ ...prev, ...payload.new }) } : null
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [queueId]);

  return { queue, loading };
}
