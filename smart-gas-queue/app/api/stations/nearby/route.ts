import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function GET(req: NextRequest) {
  const guard = checkSupabase();
  if (guard) return guard;
  try {
    const { searchParams } = new URL(req.url);
    const lat    = parseFloat(searchParams.get('lat')    ?? '');
    const lng    = parseFloat(searchParams.get('lng')    ?? '');
    const radius = parseFloat(searchParams.get('radius') ?? '10000');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'lat and lng query params are required' }, { status: 400 });
    }

    const { data, error } = await adminClient.rpc('get_nearby_stations', {
      user_lat:      lat,
      user_lng:      lng,
      radius_meters: radius,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fetch fuels for returned stations
    const stationIds = (data as { id: string }[]).map((s) => s.id);
    const { data: fuels } = await adminClient
      .from('station_fuels')
      .select('*')
      .in('station_id', stationIds);

    const fuelsByStation: Record<string, typeof fuels> = {};
    for (const f of fuels ?? []) {
      if (!fuelsByStation[f.station_id]) fuelsByStation[f.station_id] = [];
      fuelsByStation[f.station_id]!.push(f);
    }

    const stations = (data as {
      id: string; name: string; address: string; lat: number; lng: number;
      working_hours: string; image_url: string; distance_meters: number;
    }[]).map((s) => ({
      id:           s.id,
      name:         s.name,
      location:     { lat: s.lat, lng: s.lng, address: s.address },
      workingHours: s.working_hours,
      imageUrl:     s.image_url,
      distance:     parseFloat((s.distance_meters / 1000).toFixed(2)),
      fuels: (fuelsByStation[s.id] ?? []).map((f) => ({
        type:              f.fuel_type,
        available:         f.available,
        remainingQuantity: f.stock_liters,
        pricePerLiter:     f.price_per_liter,
      })),
    }));

    return NextResponse.json(stations);
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
