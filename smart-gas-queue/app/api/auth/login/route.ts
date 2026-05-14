import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function POST(request: Request) {
  const guard = checkSupabase();
  if (guard) return guard;
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    // Fetch profile for role + station info
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('role, station_id, full_name, phone')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 500 });
    }

    // Fetch vehicle if driver
    let vehicleInfo = null;
    if (profile.role === 'driver') {
      const { data: vehicle } = await adminClient
        .from('vehicles')
        .select('plate_number, vehicle_type, license_number')
        .eq('user_id', data.user.id)
        .single();
      if (vehicle) {
        vehicleInfo = {
          plateNumber:   vehicle.plate_number,
          vehicleType:   vehicle.vehicle_type,
          licenseNumber: vehicle.license_number,
        };
      }
    }

    // Fetch station name if admin
    let stationName: string | undefined;
    if (profile.role === 'station_admin' && profile.station_id) {
      const { data: station } = await adminClient
        .from('stations')
        .select('name')
        .eq('id', profile.station_id)
        .single();
      stationName = station?.name;
    }

    const user = {
      id:          data.user.id,
      email:       data.user.email!,
      fullName:    profile.full_name,
      phone:       profile.phone,
      role:        profile.role as 'driver' | 'station_admin',
      stationId:   profile.station_id ?? undefined,
      stationName: stationName,
      vehicleInfo: vehicleInfo ?? undefined,
      createdAt:   data.user.created_at,
    };

    return NextResponse.json({ user, role: profile.role });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
