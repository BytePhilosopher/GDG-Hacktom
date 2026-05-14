import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { getUserFromRequest } from '@/lib/auth';
import { queues, stations, getUserActiveQueue } from '@/lib/store';

const schema = z.object({
  stationId: z.string().min(1),
  fuelType:  z.string().min(1),
  liters:    z.number().min(1).max(500),
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

  const { stationId, fuelType, liters } = parsed.data;

  // One active queue per user
  const existing = getUserActiveQueue(user.id);
  if (existing) {
    return NextResponse.json(
      { error: 'You are already in a queue', queueId: existing.id },
      { status: 409 }
    );
  }

  const station = stations.get(stationId);
  if (!station) return NextResponse.json({ error: 'Station not found' }, { status: 404 });

  const fuel = station.fuels.find((f) => f.type === fuelType);
  if (!fuel?.available) {
    return NextResponse.json({ error: `${fuelType} is not available at this station` }, { status: 400 });
  }

  const totalPrice     = parseFloat((fuel.pricePerLiter * liters).toFixed(2));
  const advancePayment = parseFloat((totalPrice * 0.25).toFixed(2));

  // Position = active queues at this station + 1
  const position = Array.from(queues.values()).filter(
    (q) => q.stationId === stationId && (q.status === 'pending' || q.status === 'active')
  ).length + 1;

  const now   = new Date().toISOString();
  const queue = {
    id:             uuidv4(),
    driverId:       user.id,
    stationId,
    stationName:    station.name,
    fuelType,
    liters,
    totalPrice,
    advancePayment,
    paidAmount:     0,
    position,
    estimatedWait:  position * 7, // ~7 min per vehicle
    status:         'pending' as const,
    paymentStatus:  'pending' as const,
    createdAt:      now,
    updatedAt:      now,
  };

  queues.set(queue.id, queue);
  return NextResponse.json(queue, { status: 201 });
}
