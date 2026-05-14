import { NextResponse } from 'next/server';

// JWT is stateless — the client simply discards the token
export async function POST() {
  return NextResponse.json({ message: 'Logged out successfully' });
}
