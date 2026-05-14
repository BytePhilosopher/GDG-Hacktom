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
      .from('profiles')
      .select('role, station_id')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'station_admin' || !profile.station_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data, error } = await adminClient
      .from('queues')
      .select(`
        id, position, status, payment_status, fuel_type, liters,
        total_price, advance_payment, paid_amount, estimated_wait, created_at,
        profiles!driver_id(full_name, phone, vehicles(plate_number, vehicle_type))
      `)
      .eq('station_id', profile.station_id)
      .in('status', ['active', 'serving'])
      .order('position', { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const entries = (data ?? []).map((q) => {
      const p = (q.profiles as unknown) as {
        full_name: string;
        vehicles: { plate_number: string; vehicle_type: string }[] | null;
      } | null;
      const vehicle = Array.isArray(p?.vehicles) ? p.vehicles[0] : null;
      return {
        id:          q.id,
        position:    q.position,
        driverName:  p?.full_name   ?? 'Unknown',
        plateNumber: vehicle?.plate_number ?? '—',
        fuelType:    q.fuel_type,
        liters:      q.liters,
        totalPrice:  q.total_price,
        advancePaid: q.advance_payment,
        joinedAt:    q.created_at,
        status:      q.status === 'serving' ? 'serving' : 'waiting',
      };
    });

    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
