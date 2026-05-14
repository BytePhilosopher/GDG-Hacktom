import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function GET() {
  const guard = checkSupabase();
  if (guard) return guard;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: queue, error } = await adminClient
      .from('queues')
      .select('*, stations(name)')
      .eq('driver_id', user.id)
      .in('status', ['pending', 'active', 'serving'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!queue) return NextResponse.json(null);

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
      status:         queue.status,
      paymentStatus:  queue.payment_status,
      createdAt:      queue.created_at,
      updatedAt:      queue.updated_at,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
