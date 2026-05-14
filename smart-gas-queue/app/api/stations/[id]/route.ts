import { NextRequest, NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = checkSupabase();
  if (guard) return guard;
  try {
    const { id } = await params;

    const { data, error } = await adminClient
      .from('stations')
      .select('*, station_fuels(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({
      id:           data.id,
      name:         data.name,
      location:     { lat: data.lat, lng: data.lng, address: data.address },
      workingHours: data.working_hours,
      imageUrl:     data.image_url,
      fuels: (data.station_fuels ?? []).map((f: {
        fuel_type: string; available: boolean;
        stock_liters: number; price_per_liter: number;
      }) => ({
        type:              f.fuel_type,
        available:         f.available,
        remainingQuantity: f.stock_liters,
        pricePerLiter:     f.price_per_liter,
      })),
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
