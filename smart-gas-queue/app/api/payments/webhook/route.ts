import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { findPaymentByTxRef, payments, queues } from '@/lib/store';

export async function POST(req: NextRequest) {
  try {
    const chapaSignature = req.headers.get('x-chapa-signature');
    const rawBody        = await req.text();
    const webhookSecret  = process.env.CHAPA_WEBHOOK_SECRET ?? '';

    // Verify HMAC signature when secret is configured
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

    const payment = findPaymentByTxRef(tx_ref);
    if (!payment) {
      // Unknown tx_ref — acknowledge to prevent Chapa retries
      return NextResponse.json({ received: true });
    }

    // Idempotency — already processed
    if (payment.status === 'success') {
      return NextResponse.json({ received: true, note: 'already processed' });
    }

    const now = new Date().toISOString();

    if (status === 'success') {
      payments.set(payment.id, { ...payment, status: 'success', verifiedAt: now });

      const queue = queues.get(payment.queueId);
      if (queue) {
        queues.set(queue.id, {
          ...queue,
          paymentStatus: 'paid',
          status:        'active',
          paidAmount:    payment.amount,
          updatedAt:     now,
        });
      }
      console.log(`[webhook] ✅ Payment confirmed: tx_ref=${tx_ref}`);
    } else if (status === 'failed') {
      payments.set(payment.id, { ...payment, status: 'failed' });
      console.log(`[webhook] ❌ Payment failed: tx_ref=${tx_ref}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
