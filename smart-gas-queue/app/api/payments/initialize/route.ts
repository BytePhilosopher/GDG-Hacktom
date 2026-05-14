import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { payments, queues } from '@/lib/store';
import { Payment, ChapaRawInitResponse } from '@/types';

const CHAPA_API = 'https://api.chapa.co/v1';

const schema = z.object({
  stationId: z.string().min(1),
  queueId:   z.string().min(1),
  fuelType:  z.string().min(1),
  liters:    z.number().min(1),
  amount:    z.number().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body: unknown;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 }); }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  const { queueId, fuelType, liters, amount } = parsed.data;

  // Verify queue exists and belongs to this user
  const queue = queues.get(queueId);
  if (!queue || queue.driverId !== user.id) {
    return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
  }
  if (queue.paymentStatus === 'paid') {
    return NextResponse.json({ error: 'Queue is already paid' }, { status: 409 });
  }

  const nameParts = user.fullName.split(' ');
  // tx_ref: queue-{8 chars}-{8 chars} = 25 chars (well under Chapa's 50-char limit)
  const txRef  = `queue-${queueId.slice(0, 8)}-${uuidv4().slice(0, 8)}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  const chapaPayload = {
    amount:       amount.toFixed(2),
    currency:     'ETB',
    email:        user.email,
    first_name:   nameParts[0],
    last_name:    nameParts.slice(1).join(' ') || 'User',
    phone_number: user.phone,
    tx_ref:       txRef,
    callback_url: `${appUrl}/api/payments/webhook`,
    return_url:   `${appUrl}/payment/success?trx_ref=${txRef}&queueId=${queueId}`,
    customization: {
      title:       'FuelQ Payment',          // ≤16 chars
      description: `${liters}L ${fuelType} advance`, // alphanumeric + spaces
    },
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
    chapaData = (await chapaRes.json()) as ChapaRawInitResponse;
  } catch {
    return NextResponse.json(
      { error: 'Could not reach Chapa. Please try again.' },
      { status: 502 }
    );
  }

  if (chapaData.status !== 'success') {
    console.error('[payments/initialize] Chapa error:', chapaData);
    return NextResponse.json(
      { error: 'Payment could not be processed. Please try again or use a different payment method.',
        detail: chapaData.message },
      { status: 502 }
    );
  }

  // Persist payment record
  const payment: Payment = {
    id:          uuidv4(),
    queueId,
    userId:      user.id,
    txRef,
    amount,
    currency:    'ETB',
    status:      'pending',
    initiatedAt: new Date().toISOString(),
  };
  payments.set(payment.id, payment);

  return NextResponse.json({
    checkoutUrl: chapaData.data.checkout_url,
    txRef,
  });
}
