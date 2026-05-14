import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { queues } from '@/lib/store';

export async function GET(
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

  const totalInQueue = Array.from(queues.values()).filter(
    (q) => q.stationId === queue.stationId && (q.status === 'pending' || q.status === 'active')
  ).length;

  return NextResponse.json({
    position:       queue.position,
    estimatedWait:  queue.estimatedWait,
    totalInQueue,
    status:         queue.status,
    paymentStatus:  queue.paymentStatus,
    fuelType:       queue.fuelType,
    liters:         queue.liters,
    advancePayment: queue.advancePayment,
    stationName:    queue.stationName,
  });
}
