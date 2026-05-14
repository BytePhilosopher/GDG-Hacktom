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

    const { data, error } = await adminClient
      .from('queues')
      .select('*, stations(name)')
      .eq('driver_id', user.id)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const history = (data ?? []).map((q) => ({
      id:             q.id,
      driverId:       q.driver_id,
      stationId:      q.station_id,
      stationName:    (q.stations as { name: string } | null)?.name,
      fuelType:       q.fuel_type,
      liters:         q.liters,
      totalPrice:     q.total_price,
      advancePayment: q.advance_payment,
      paidAmount:     q.paid_amount,
      position:       q.position,
      estimatedWait:  q.estimated_wait,
      status:         q.status,
      paymentStatus:  q.payment_status,
      createdAt:      q.created_at,
      updatedAt:      q.updated_at,
    }));

    return NextResponse.json(history);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
