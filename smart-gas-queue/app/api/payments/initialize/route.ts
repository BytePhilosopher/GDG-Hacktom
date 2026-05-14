import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';
import { ChapaRawInitResponse } from '@/types';

const CHAPA_API = 'https://api.chapa.co/v1';

const schema = z.object({
  stationId: z.string().min(1),
  queueId:   z.string().uuid(),
  fuelType:  z.string().min(1),
  liters:    z.number().min(1),
  amount:    z.number().min(1),
});

export async function POST(req: NextRequest) {
  const guard = checkSupabase();
  if (guard) return guard;

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try { body = await req.json(); }
    catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { queueId, fuelType, liters, amount } = parsed.data;

    const { data: queue, error: queueError } = await adminClient
      .from('queues')
      .select('id, driver_id, payment_status')
      .eq('id', queueId)
      .single();

    if (queueError || !queue) {
      return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
    }
    if (queue.driver_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (queue.payment_status === 'paid') {
      return NextResponse.json({ error: 'Queue is already paid' }, { status: 409 });
    }

    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single();

    const nameParts = (profile?.full_name ?? 'User').split(' ');
    const txRef     = `queue-${queueId.slice(0, 8)}-${uuidv4().slice(0, 8)}`;
    const appUrl    = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');

    // Chapa rejects test/internal email domains — use a sanitised fallback
    const chapaEmail = (user.email ?? '').includes('@') ? user.email! : `user_${user.id.slice(0,8)}@fuelq.et`;

    const chapaPayload = {
      amount:        amount.toFixed(2),
      currency:      'ETB',
      email:         chapaEmail,
      first_name:    nameParts[0],
      last_name:     nameParts.slice(1).join(' ') || 'User',
      phone_number:  profile?.phone ?? '',
      tx_ref:        txRef,
      callback_url:  `${appUrl}/api/payments/webhook`,
      return_url:    `${appUrl}/queue/${queueId}?trx_ref=${txRef}`,
      customization: { title: 'FuelQ Payment', description: `${liters}L ${fuelType} advance` },
    };

    let chapaData: ChapaRawInitResponse;
    try {
      const chapaRes = await fetch(`${CHAPA_API}/transaction/initialize`, {
        method:  'POST',
        headers: {
          Authorization:     `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type':    'application/json',
          'Idempotency-Key': txRef,
        },
        body: JSON.stringify(chapaPayload),
      });
      chapaData = await chapaRes.json() as ChapaRawInitResponse;
    } catch {
      return NextResponse.json({ error: 'Could not reach Chapa. Please try again.' }, { status: 502 });
    }

    if (chapaData.status !== 'success') {
      return NextResponse.json({ error: 'Payment could not be processed.', detail: chapaData.message }, { status: 502 });
    }

    const { error: paymentError } = await adminClient.from('payments').insert({
      queue_id:     queueId,
      user_id:      user.id,
      tx_ref:       txRef,
      amount,
      currency:     'ETB',
      status:       'pending',
      initiated_at: new Date().toISOString(),
    });

    if (paymentError) {
      return NextResponse.json({ error: paymentError.message }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl: chapaData.data.checkout_url, txRef, advanceAmount: amount, totalAmount: amount / 0.25 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
