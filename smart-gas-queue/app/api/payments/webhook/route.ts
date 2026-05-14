import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

export async function POST(req: NextRequest) {
  // Webhook must work even without full Supabase config during testing,
  // but we still need the admin client — guard only if truly unconfigured.
  const guard = checkSupabase();
  if (guard) return guard;

  try {
    const chapaSignature = req.headers.get('x-chapa-signature');
    const rawBody        = await req.text();
    const webhookSecret  = process.env.CHAPA_WEBHOOK_SECRET ?? '';

    if (webhookSecret && chapaSignature) {
      const expected = crypto
        .createHmac('sha256', webhookSecret)
        .update(rawBody)
        .digest('hex');
      if (chapaSignature !== expected) {
        console.error('[webhook] Invalid Chapa signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    let event: { tx_ref?: string; status?: string };
    try { event = JSON.parse(rawBody); }
    catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

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

    if (payment.status === 'success') {
      return NextResponse.json({ received: true, note: 'already processed' });
    }

    const now = new Date().toISOString();

    if (status === 'success') {
      await adminClient.from('payments')
        .update({ status: 'success', verified_at: now }).eq('id', payment.id);
      await adminClient.from('queues')
        .update({ payment_status: 'paid', status: 'active', paid_amount: payment.amount })
        .eq('id', payment.queue_id);
      console.log(`[webhook] ✅ Payment confirmed: tx_ref=${tx_ref}`);
    } else if (status === 'failed') {
      await adminClient.from('payments')
        .update({ status: 'failed' }).eq('id', payment.id);
      console.log(`[webhook] ❌ Payment failed: tx_ref=${tx_ref}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
