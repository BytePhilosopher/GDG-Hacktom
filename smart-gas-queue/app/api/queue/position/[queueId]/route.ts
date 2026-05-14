import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ queueId: string }> }
) {
  const guard = checkSupabase();
  if (guard) return guard;
  try {
    const { queueId } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: queue, error } = await adminClient
      .from('queues')
      .select('*, stations(name)')
      .eq('id', queueId)
      .single();

    if (error || !queue) {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }
    if (queue.driver_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Count total active in this station's queue
    const { count } = await adminClient
      .from('queues')
      .select('id', { count: 'exact', head: true })
      .eq('station_id', queue.station_id)
      .in('status', ['pending', 'active', 'serving']);

    return NextResponse.json({
      id:             queue.id,
      driverId:       queue.driver_id,
      stationId:      queue.station_id,
      stationName:    (queue.stations as { name: string } | null)?.name,
      fuelType:       queue.fuel_type,
      liters:         queue.liters,
      totalPrice:     queue.total_price,
      advancePayment: queue.advance_payment,
      paidAmount:     queue.paid_amount,
      position:       queue.position,
      estimatedWait:  queue.estimated_wait,
      totalInQueue:   count ?? 0,
      status:         queue.status,
      paymentStatus:  queue.payment_status,
      createdAt:      queue.created_at,
      updatedAt:      queue.updated_at,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
