import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function DELETE(
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

    const { data: queue } = await adminClient
      .from('queues').select('id, driver_id, station_id, position')
      .eq('id', id).eq('station_id', profile.station_id).single();

    if (!queue) return NextResponse.json({ error: 'Queue entry not found' }, { status: 404 });

    await adminClient.from('queues').update({ status: 'cancelled' }).eq('id', id);
    await adminClient.rpc('shift_queue_positions', {
      p_station_id: profile.station_id, p_completed_position: queue.position,
    });
    await adminClient.from('queue_history').insert({
      queue_id: id, station_id: profile.station_id,
      driver_id: queue.driver_id, action: 'cancelled', performed_by: user.id,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
