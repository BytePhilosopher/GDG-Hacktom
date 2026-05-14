import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { passwordHash: _pw, ...safe } = user; // eslint-disable-line @typescript-eslint/no-unused-vars
  return NextResponse.json(safe);
}
