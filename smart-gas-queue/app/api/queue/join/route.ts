import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

const schema = z.object({
  stationId: z.string().uuid('Invalid station ID'),
  fuelType:  z.string().min(1),
  liters:    z.number().min(1).max(500),
});

export async function POST(req: NextRequest) {
  const guard = checkSupabase();
  if (guard) return guard;
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { stationId, fuelType, liters } = parsed.data;

    // One active queue per driver
    const { data: existing } = await adminClient
      .from('queues')
      .select('id')
      .eq('driver_id', user.id)
      .in('status', ['pending', 'active', 'serving'])
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'You are already in a queue', queueId: existing.id },
        { status: 409 }
      );
    }

    // Verify station + fuel availability
    const { data: fuel, error: fuelError } = await adminClient
      .from('station_fuels')
      .select('available, stock_liters, price_per_liter')
      .eq('station_id', stationId)
      .eq('fuel_type', fuelType)
      .single();

    if (fuelError || !fuel) {
      return NextResponse.json({ error: 'Fuel type not found at this station' }, { status: 404 });
    }
    if (!fuel.available) {
      return NextResponse.json({ error: `${fuelType} is not available at this station` }, { status: 400 });
    }

    const totalPrice     = parseFloat((fuel.price_per_liter * liters).toFixed(2));
    const advancePayment = parseFloat((totalPrice * 0.25).toFixed(2));

    // Get next position
    const { data: maxRow } = await adminClient
      .from('queues')
      .select('position')
      .eq('station_id', stationId)
      .in('status', ['pending', 'active', 'serving'])
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const position     = (maxRow?.position ?? 0) + 1;
    const estimatedWait = (position - 1) * 7;

    const { data: queue, error: insertError } = await adminClient
      .from('queues')
      .insert({
        driver_id:       user.id,
        station_id:      stationId,
        fuel_type:       fuelType,
        liters,
        total_price:     totalPrice,
        advance_payment: advancePayment,
        position,
        estimated_wait:  estimatedWait,
        status:          'pending',
        payment_status:  'pending',
      })
      .select('*, stations(name)')
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Audit log
    await adminClient.from('queue_history').insert({
      queue_id:   queue.id,
      station_id: stationId,
      driver_id:  user.id,
      action:     'joined',
    });

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
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
