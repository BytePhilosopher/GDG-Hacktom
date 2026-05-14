import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { findPaymentByTxRef, payments, queues } from '@/lib/store';
import { ChapaRawVerifyResponse } from '@/types';

const CHAPA_API = 'https://api.chapa.co/v1';

export async function GET(
  req: NextRequest,
  { params }: { params: { txRef: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { txRef } = params;

  // Check our store first
  const payment = findPaymentByTxRef(txRef);
  if (!payment) {
    return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
  }

  // Already verified — return cached result (idempotent)
  if (payment.status === 'success') {
    return NextResponse.json({
      verified: true,
      success:  true,
      queueId:  payment.queueId,
      status:   'success',
      amount:   payment.amount,
      method:   payment.method ?? 'unknown',
    });
  }

  // Call Chapa to verify
  let chapaData: ChapaRawVerifyResponse;
  try {
    const chapaRes = await fetch(`${CHAPA_API}/transaction/verify/${encodeURIComponent(txRef)}`, {
      headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` },
    });
    chapaData = (await chapaRes.json()) as ChapaRawVerifyResponse;
  } catch {
    return NextResponse.json(
      { verified: false, success: false, message: 'Could not reach Chapa. Please try again.' },
      { status: 502 }
    );
  }

  if (chapaData.status !== 'success' || chapaData.data?.status !== 'success') {
    return NextResponse.json({
      verified: false,
      success:  false,
      queueId:  payment.queueId,
      status:   chapaData.data?.status ?? 'pending',
      amount:   payment.amount,
      message:  chapaData.data?.status === 'pending'
        ? 'Payment is still pending. Please wait a moment and try again.'
        : 'Payment was not completed.',
    });
  }

  // Update store atomically
  const now = new Date().toISOString();
  payments.set(payment.id, {
    ...payment,
    status:     'success',
    chapaRef:   chapaData.data.reference,
    method:     chapaData.data.method,
    verifiedAt: now,
  });

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

  return NextResponse.json({
    verified: true,
    success:  true,
    queueId:  payment.queueId,
    status:   'success',
    amount:   payment.amount,
    method:   chapaData.data.method,
  });
}
