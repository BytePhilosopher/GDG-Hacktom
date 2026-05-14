import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';
import { ChapaRawVerifyResponse } from '@/types';

const CHAPA_API = 'https://api.chapa.co/v1';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ txRef: string }> }
) {
  const guard = checkSupabase();
  if (guard) return guard;

  try {
    const { txRef } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .select('id, queue_id, amount, status, method')
      .eq('tx_ref', txRef)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // Idempotent — already verified
    if (payment.status === 'success') {
      return NextResponse.json({
        verified: true,
        success:  true,
        queueId:  payment.queue_id,
        status:   'success',
        amount:   payment.amount,
        method:   payment.method ?? 'unknown',
      });
    }

    // Call Chapa to verify
    let chapaData: ChapaRawVerifyResponse;
    try {
      const chapaRes = await fetch(
        `${CHAPA_API}/transaction/verify/${encodeURIComponent(txRef)}`,
        { headers: { Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}` } }
      );
      chapaData = await chapaRes.json() as ChapaRawVerifyResponse;
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
        queueId:  payment.queue_id,
        status:   chapaData.data?.status ?? 'pending',
        amount:   payment.amount,
        message:  chapaData.data?.status === 'pending'
          ? 'Payment is still pending. Please wait a moment and try again.'
          : 'Payment was not completed.',
      });
    }

    const now = new Date().toISOString();

    await adminClient
      .from('payments')
      .update({ status: 'success', chapa_ref: chapaData.data.reference, method: chapaData.data.method, verified_at: now })
      .eq('tx_ref', txRef);

    await adminClient
      .from('queues')
      .update({ payment_status: 'paid', status: 'active', paid_amount: payment.amount })
      .eq('id', payment.queue_id);

    return NextResponse.json({
      verified: true,
      success:  true,
      queueId:  payment.queue_id,
      status:   'success',
      amount:   payment.amount,
      method:   chapaData.data.method,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
