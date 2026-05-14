import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function GET() {
  const guard = checkSupabase();
  if (guard) return guard;
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, station_id, full_name, phone')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 500 });
    }

    let vehicleInfo = null;
    if (profile.role === 'driver') {
      const { data: vehicle } = await adminClient
        .from('vehicles')
        .select('plate_number, vehicle_type, license_number')
        .eq('user_id', user.id)
        .single();
      if (vehicle) {
        vehicleInfo = {
          plateNumber:   vehicle.plate_number,
          vehicleType:   vehicle.vehicle_type,
          licenseNumber: vehicle.license_number,
        };
      }
    }

    let stationName: string | undefined;
    if (profile.role === 'station_admin' && profile.station_id) {
      const { data: station } = await adminClient
        .from('stations')
        .select('name')
        .eq('id', profile.station_id)
        .single();
      stationName = station?.name;
    }

    return NextResponse.json({
      id:          user.id,
      email:       user.email!,
      fullName:    profile.full_name,
      phone:       profile.phone,
      role:        profile.role as 'driver' | 'station_admin',
      stationId:   profile.station_id ?? undefined,
      stationName: stationName,
      vehicleInfo: vehicleInfo ?? undefined,
      createdAt:   user.created_at,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
