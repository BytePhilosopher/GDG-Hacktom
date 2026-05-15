import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = checkSupabase();
  if (guard) return guard;

  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await adminClient
      .from('profiles').select('role, station_id').eq('id', user.id).single();

    if (profile?.role !== 'station_admin' || !profile.station_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stationId = profile.station_id as string;

    const { data: queue, error: queueFetchError } = await adminClient
      .from('queues')
      .select('id, driver_id, station_id, position, fuel_type, liters')
      .eq('id', id)
      .eq('station_id', stationId)
      .single();

    if (queueFetchError || !queue) {
      return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });
    }

    const liters = Math.max(0, Number(queue.liters ?? 0));
    const fuelType = queue.fuel_type as string | null;

    const { error: statusErr } = await adminClient
      .from('queues')
      .update({ status: 'completed' })
      .eq('id', id);
    if (statusErr) {
      return NextResponse.json({ error: statusErr.message }, { status: 500 });
    }

    const { error: shiftErr } = await adminClient.rpc('shift_queue_positions', {
      p_station_id: stationId,
      p_completed_position: queue.position,
    });
    if (shiftErr) {
      return NextResponse.json({ error: shiftErr.message }, { status: 500 });
    }

    const { error: histErr } = await adminClient.from('queue_history').insert({
      queue_id: id,
      station_id: stationId,
      driver_id: queue.driver_id,
      action: 'completed',
      performed_by: user.id,
    });
    if (histErr) {
      return NextResponse.json({ error: histErr.message }, { status: 500 });
    }

    if (liters > 0 && fuelType) {
      const { data: fuel, error: fuelErr } = await adminClient
        .from('station_fuels')
        .select('stock_liters')
        .eq('station_id', stationId)
        .eq('fuel_type', fuelType)
        .maybeSingle();

      if (!fuelErr && fuel && fuel.stock_liters != null) {
        const current = Number(fuel.stock_liters);
        const nextStock = Math.max(0, current - liters);
        const { error: stockErr } = await adminClient
          .from('station_fuels')
          .update({ stock_liters: nextStock })
          .eq('station_id', stationId)
          .eq('fuel_type', fuelType);

        if (stockErr) {
          return NextResponse.json(
            {
              error:
                'Driver marked complete, but fuel inventory could not be updated. Adjust stock manually in admin.',
              details: stockErr.message,
            },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
