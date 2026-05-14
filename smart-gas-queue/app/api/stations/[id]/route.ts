import { NextRequest, NextResponse } from 'next/server';
import { stations } from '@/lib/store';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const station = stations.get(params.id);
  if (!station) {
    return NextResponse.json({ error: 'Station not found' }, { status: 404 });
  }
  return NextResponse.json(station);
}
