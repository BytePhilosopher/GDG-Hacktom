import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';
import { ChapaRawInitResponse } from '@/types';

const CHAPA_API = 'https://api.chapa.co/v1';

// Only the queue id is trusted from the client. The charge amount, fuel type,
// and liters are re-derived server-side from the queue row created at join
// time — never taken from the request body (prevents amount tampering).
const schema = z.object({
  queueId: z.string().uuid(),
});

export async function POST(req: NextRequest) {
  const guard = checkSupabase();
  if (guard) return guard;

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { queueId } = parsed.data;

    if (!process.env.CHAPA_SECRET_KEY) {
      console.error('[payments/initialize] CHAPA_SECRET_KEY is not configured');
      return NextResponse.json(
        { error: 'Payments are not configured on this server.' },
        { status: 503 }
      );
    }

    const { data: queue, error: queueError } = await adminClient
      .from('queues')
      .select('id, driver_id, payment_status, advance_payment, fuel_type, liters')
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

    // Authoritative values, computed and stored server-side at join time.
    const amount = Number(queue.advance_payment);
    const fuelType = queue.fuel_type;
    const liters = queue.liters;
    if (!Number.isFinite(amount) || amount < 1) {
      return NextResponse.json({ error: 'Queue has no valid amount due' }, { status: 400 });
    }

    const { data: profile } = await adminClient
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single();

    const nameParts = (profile?.full_name ?? 'User').split(' ');
    const txRef = `queue-${queueId.slice(0, 8)}-${uuidv4().slice(0, 8)}`;
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000').replace(/\/$/, '');

    // Chapa's email field is optional AND strictly validated (DNS-level domain
    // checks) — a fabricated fallback address would be rejected outright, so
    // only include the user's real email when present.
    const chapaEmail = (user.email ?? '').includes('@') ? user.email : undefined;

    const chapaPayload: Record<string, unknown> = {
      amount: amount.toFixed(2),
      currency: 'ETB',
      ...(chapaEmail ? { email: chapaEmail } : {}),
      first_name: nameParts[0],
      last_name: nameParts.slice(1).join(' ') || 'User',
      phone_number: profile?.phone ?? '',
      tx_ref: txRef,
      callback_url: `${appUrl}/api/payments/webhook`,
      return_url: `${appUrl}/queue/${queueId}?trx_ref=${txRef}`,
      customization: { title: 'FuelQ Payment', description: `${liters}L ${fuelType} advance` },
    };

    const initializeWithChapa = async (
      payload: Record<string, unknown>,
      idempotencyKey: string
    ): Promise<ChapaRawInitResponse> => {
      const chapaRes = await fetch(`${CHAPA_API}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify(payload),
      });
      return (await chapaRes.json()) as ChapaRawInitResponse;
    };

    let chapaData: ChapaRawInitResponse;
    try {
      chapaData = await initializeWithChapa(chapaPayload, txRef);

      // Chapa DNS-validates email domains and rejects unfamiliar ones even for
      // syntactically valid addresses. Email is optional to Chapa — retry once
      // without it instead of failing the whole payment.
      const emailRejected =
        chapaData.status !== 'success' &&
        typeof chapaData.message === 'object' &&
        chapaData.message !== null &&
        'email' in chapaData.message;

      if (chapaEmail && emailRejected) {
        console.warn('[payments/initialize] Chapa rejected email — retrying without it');
        const { email: _email, ...payloadWithoutEmail } = chapaPayload;
        chapaData = await initializeWithChapa(payloadWithoutEmail, `${txRef}-ne`);
      }
    } catch {
      return NextResponse.json(
        { error: 'Could not reach Chapa. Please try again.' },
        { status: 502 }
      );
    }

    if (chapaData.status !== 'success') {
      console.error(
        '[payments/initialize] Chapa rejected the transaction:',
        JSON.stringify(chapaData.message)
      );
      return NextResponse.json({ error: 'Payment could not be processed.' }, { status: 502 });
    }

    // NOTE: never delete earlier pending payment rows here. A driver can
    // initialize twice (back button, double tap) and still complete the FIRST
    // checkout link — its tx_ref must remain resolvable so the webhook/verify
    // can credit the queue. Multiple pending rows per queue are harmless: the
    // first one to succeed flips the queue, and the "already paid" guard above
    // blocks any further initialization.
    const { error: paymentError } = await adminClient.from('payments').insert({
      queue_id: queueId,
      user_id: user.id,
      tx_ref: txRef,
      amount,
      currency: 'ETB',
      status: 'pending',
      initiated_at: new Date().toISOString(),
    });

    if (paymentError) {
      console.error('[payments/initialize] Failed to record payment:', paymentError);
      return NextResponse.json({ error: 'Could not record payment' }, { status: 500 });
    }

    return NextResponse.json({
      checkoutUrl: chapaData.data.checkout_url,
      txRef,
      advanceAmount: amount,
      totalAmount: Math.round((amount / 0.25) * 100) / 100,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
