import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function POST(req: NextRequest) {
  const guard = checkSupabase();
  if (guard) return guard;

  try {
    const rawBody = await req.text();
    const webhookSecret = process.env.CHAPA_WEBHOOK_SECRET ?? '';

    // Signature verification is mandatory. A missing secret is a server
    // misconfiguration (fail closed, 500); a missing/invalid signature on the
    // request is rejected (401). Never trust an unsigned webhook body.
    if (!webhookSecret) {
      console.error('[webhook] CHAPA_WEBHOOK_SECRET is not configured — rejecting webhook');
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
    }

    // Chapa signs webhooks two ways (see developer.chapa.co):
    //   Chapa-Signature:   HMAC-SHA256 of the request payload, keyed by the webhook secret
    //   x-chapa-signature: HMAC-SHA256 of the webhook secret itself, keyed by the secret
    // Accept either header with its correct digest; reject everything else.
    const safeEqual = (received: string, expected: string): boolean => {
      const a = Buffer.from(received);
      const b = Buffer.from(expected);
      return a.length === b.length && crypto.timingSafeEqual(a, b);
    };

    const payloadDigest = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    const secretDigest = crypto
      .createHmac('sha256', webhookSecret)
      .update(webhookSecret)
      .digest('hex');

    const chapaSignature = req.headers.get('chapa-signature');
    const xChapaSignature = req.headers.get('x-chapa-signature');

    if (!chapaSignature && !xChapaSignature) {
      console.error('[webhook] Missing Chapa signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    const signatureValid =
      (chapaSignature !== null &&
        (safeEqual(chapaSignature, payloadDigest) || safeEqual(chapaSignature, secretDigest))) ||
      (xChapaSignature !== null &&
        (safeEqual(xChapaSignature, secretDigest) || safeEqual(xChapaSignature, payloadDigest)));

    if (!signatureValid) {
      console.error('[webhook] Invalid Chapa signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    let event: { tx_ref?: string; status?: string };
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { tx_ref, status } = event;
    if (!tx_ref) return NextResponse.json({ received: true });

    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .select('id, queue_id, amount, status')
      .eq('tx_ref', tx_ref)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ received: true }); // unknown tx_ref — ack to stop retries
    }

    // 'paid' is the payment_status enum value in the DB (there is no 'success').
    if (payment.status === 'paid') {
      return NextResponse.json({ received: true, note: 'already processed' });
    }

    const now = new Date().toISOString();

    // Chapa's webhook event uses status: 'success' | 'failed'.
    if (status === 'success') {
      const { error: payErr } = await adminClient
        .from('payments')
        .update({ status: 'paid', verified_at: now })
        .eq('id', payment.id);
      const { error: queueErr } = await adminClient
        .from('queues')
        .update({ payment_status: 'paid', status: 'active', paid_amount: payment.amount })
        .eq('id', payment.queue_id);
      if (payErr || queueErr) {
        // Return 500 so Chapa retries the webhook rather than treating it as done.
        console.error('[webhook] Failed to persist payment success:', payErr ?? queueErr);
        return NextResponse.json({ error: 'Could not persist payment' }, { status: 500 });
      }
    } else if (status === 'failed') {
      const { error: failErr } = await adminClient
        .from('payments')
        .update({ status: 'failed' })
        .eq('id', payment.id);
      if (failErr) console.error('[webhook] Failed to mark payment failed:', failErr);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
