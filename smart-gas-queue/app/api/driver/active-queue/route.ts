import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getUserActiveQueue, stations } from '@/lib/store';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const queue = getUserActiveQueue(user.id);
  if (!queue) return NextResponse.json(null);

  const station = stations.get(queue.stationId);
  return NextResponse.json({ ...queue, stationName: station?.name ?? queue.stationName });
}
