import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

const schema = z.object({
  stockLiters:   z.number().min(0).optional(),
  pricePerLiter: z.number().min(0).optional(),
  available:     z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ fuelType: string }> }
) {
  const guard = checkSupabase();
  if (guard) return guard;

  try {
    const { fuelType } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await adminClient
      .from('profiles').select('role, station_id').eq('id', user.id).single();

    if (profile?.role !== 'station_admin' || !profile.station_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.stockLiters   !== undefined) updates.stock_liters    = parsed.data.stockLiters;
    if (parsed.data.pricePerLiter !== undefined) updates.price_per_liter = parsed.data.pricePerLiter;
    if (parsed.data.available     !== undefined) updates.available       = parsed.data.available;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { error } = await adminClient
      .from('station_fuels')
      .update(updates)
      .eq('station_id', profile.station_id)
      .eq('fuel_type', fuelType);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
