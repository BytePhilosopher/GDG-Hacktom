import { NextRequest, NextResponse } from 'next/server';
import { stations, distanceKm } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lat    = parseFloat(searchParams.get('lat')    ?? '');
  const lng    = parseFloat(searchParams.get('lng')    ?? '');
  const radius = parseFloat(searchParams.get('radius') ?? '5000'); // metres

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json({ error: 'lat and lng query params are required' }, { status: 400 });
  }

  const radiusKm = radius / 1000;

  const nearby = Array.from(stations.values())
    .map((s) => ({
      ...s,
      distance: parseFloat(
        distanceKm(lat, lng, s.location.lat, s.location.lng).toFixed(2)
      ),
    }))
    .filter((s) => s.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);

  return NextResponse.json(nearby);
}
