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
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await adminClient
      .from('profiles').select('role, station_id').eq('id', user.id).single();

    if (profile?.role !== 'station_admin' || !profile.station_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const stationId  = profile.station_id as string;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [inQueueRes, completedRes, fuelRes] = await Promise.all([
      adminClient.from('queues')
        .select('id', { count: 'exact', head: true })
        .eq('station_id', stationId).in('status', ['active', 'serving']),
      adminClient.from('queues')
        .select('id', { count: 'exact', head: true })
        .eq('station_id', stationId).eq('status', 'completed')
        .gte('updated_at', todayStart.toISOString()),
      adminClient.from('station_fuels')
        .select('stock_liters').eq('station_id', stationId),
    ]);

    const totalFuelRemaining = (fuelRes.data ?? []).reduce(
      (sum, f) => sum + (f.stock_liters ?? 0), 0
    );

    return NextResponse.json({
      totalInQueue:       inQueueRes.count ?? 0,
      completedToday:     completedRes.count ?? 0,
      totalFuelRemaining: parseFloat(totalFuelRemaining.toFixed(2)),
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
