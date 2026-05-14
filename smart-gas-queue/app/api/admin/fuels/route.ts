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

    const { data, error } = await adminClient
      .from('station_fuels')
      .select('fuel_type, available, stock_liters, price_per_liter')
      .eq('station_id', profile.station_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json((data ?? []).map((f) => ({
      type:          f.fuel_type,
      available:     f.available,
      stockLiters:   f.stock_liters,
      pricePerLiter: f.price_per_liter,
    })));
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
