import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { queues } from '@/lib/store';

export async function DELETE(
  req: NextRequest,
  { params }: { params: { queueId: string } }
) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const queue = queues.get(params.queueId);
  if (!queue) return NextResponse.json({ error: 'Queue not found' }, { status: 404 });
  if (queue.driverId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (queue.status === 'completed') {
    return NextResponse.json({ error: 'Cannot cancel a completed queue' }, { status: 400 });
  }
  if (queue.status === 'cancelled') {
    return NextResponse.json({ error: 'Queue is already cancelled' }, { status: 400 });
  }

  const now = new Date().toISOString();
  queues.set(queue.id, { ...queue, status: 'cancelled', updatedAt: now });

  return NextResponse.json({ success: true, status: 'cancelled' });
}
