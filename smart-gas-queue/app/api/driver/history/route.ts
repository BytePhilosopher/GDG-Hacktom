import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { queues, stations } from '@/lib/store';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const history = Array.from(queues.values())
    .filter((q) => q.driverId === user.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((q) => ({
      ...q,
      stationName: stations.get(q.stationId)?.name ?? q.stationName ?? 'Unknown',
    }));

  return NextResponse.json(history);
}
