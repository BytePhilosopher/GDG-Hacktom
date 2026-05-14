import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function DELETE(
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

    const { data: queue, error: fetchError } = await adminClient
      .from('queues')
      .select('id, driver_id, station_id, status')
      .eq('id', queueId)
      .single();

    if (fetchError || !queue) {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }
    if (queue.driver_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (queue.status === 'completed') {
      return NextResponse.json({ error: 'Cannot cancel a completed queue' }, { status: 400 });
    }
    if (queue.status === 'cancelled') {
      return NextResponse.json({ error: 'Queue is already cancelled' }, { status: 400 });
    }

    const { error: updateError } = await adminClient
      .from('queues')
      .update({ status: 'cancelled' })
      .eq('id', queueId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // Audit log
    await adminClient.from('queue_history').insert({
      queue_id:   queueId,
      station_id: queue.station_id,
      driver_id:  user.id,
      action:     'cancelled',
    });

    return NextResponse.json({ success: true, status: 'cancelled' });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
