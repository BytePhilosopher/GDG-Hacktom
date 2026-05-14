import { Queue, QueueRequest } from '@/types';
import { createClient } from '@/lib/supabase/client';

/**
 * All mutating operations (join, cancel) go through the API routes so the
 * server-side Supabase session cookie is used for auth.
 *
 * Read operations (position, active queue, history) use the Supabase client
 * directly — RLS allows drivers to read their own rows.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toQueue(raw: any): Queue {
  return {
    id:             raw.id,
    driverId:       raw.driver_id ?? raw.driverId,
    stationId:      raw.station_id ?? raw.stationId,
    stationName:    raw.stations?.name ?? raw.stationName,
    fuelType:       raw.fuel_type ?? raw.fuelType,
    liters:         raw.liters,
    totalPrice:     raw.total_price ?? raw.totalPrice,
    advancePayment: raw.advance_payment ?? raw.advancePayment,
    paidAmount:     raw.paid_amount ?? raw.paidAmount,
    position:       raw.position,
    estimatedWait:  raw.estimated_wait ?? raw.estimatedWait,
    status:         raw.status,
    paymentStatus:  raw.payment_status ?? raw.paymentStatus,
    createdAt:      raw.created_at ?? raw.createdAt,
    updatedAt:      raw.updated_at ?? raw.updatedAt,
  };
}

class QueueService {
  /**
   * Join a station queue.
   * Calls POST /api/queue/join — server validates fuel availability and position.
   */
  async joinQueue(data: QueueRequest): Promise<Queue> {
    const res = await fetch('/api/queue/join', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify({
        stationId: data.stationId,
        fuelType:  data.fuelType,
        liters:    data.liters,
      }),
    });

    const json = await res.json();
    if (!res.ok) {
      const err = new Error(json.error ?? `Failed to join queue (${res.status})`);
      // Attach queueId for 409 conflict case
      if (res.status === 409 && json.queueId) {
        (err as Error & { queueId?: string }).queueId = json.queueId;
      }
      throw err;
    }
    return toQueue(json);
  }

  /**
   * Get current queue position.
   * Calls GET /api/queue/position/:queueId — server verifies ownership.
   */
  async getQueuePosition(queueId: string): Promise<Queue> {
    const res = await fetch(`/api/queue/position/${queueId}`, {
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Queue not found');
    return toQueue(json);
  }

  /**
   * Cancel a queue entry.
   * Calls DELETE /api/queue/cancel/:queueId — server verifies ownership.
   */
  async cancelQueue(queueId: string): Promise<void> {
    const res = await fetch(`/api/queue/cancel/${queueId}`, {
      method:      'DELETE',
      credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Failed to cancel queue');
  }

  /**
   * Get the driver's current active queue entry.
   * Calls GET /api/driver/active-queue.
   */
  async getActiveQueue(): Promise<Queue | null> {
    const res = await fetch('/api/driver/active-queue', { credentials: 'include' });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json) return null;
    return toQueue(json);
  }

  /**
   * Get the driver's queue history.
   * Calls GET /api/driver/history.
   */
  async getHistory(): Promise<Queue[]> {
    const res = await fetch('/api/driver/history', { credentials: 'include' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error ?? 'Failed to fetch history');
    return (json as Queue[]).map(toQueue);
  }
}

export const queueService = new QueueService();

// ── Supabase Realtime helper (used by useQueuePosition hook) ──────────────────
// Keep the direct Supabase client for real-time subscriptions only.
export function getSupabaseClient() {
  return createClient();
}
