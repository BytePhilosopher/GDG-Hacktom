import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';
import { users } from './store';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ?? 'fuelq-fallback-secret-change-in-production'
);

export async function signToken(payload: { id: string; email: string }): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

export async function verifyToken(token: string): Promise<{ id: string; email: string }> {
  const { payload } = await jwtVerify(token, secret);
  return payload as { id: string; email: string };
}

export async function getUserFromRequest(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const payload = await verifyToken(auth.slice(7));
    return users.get(payload.id) ?? null;
  } catch {
    return null;
  }
}
