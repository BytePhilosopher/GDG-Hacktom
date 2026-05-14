import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { users } from '@/lib/store';
import { signToken } from '@/lib/auth';

type StoredUser = { passwordHash: string; id: string; email: string; fullName: string; phone: string; vehicleInfo: { plateNumber: string; vehicleType: string; licenseNumber: string }; createdAt: string };

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    let found: StoredUser | undefined;
    for (const u of Array.from(users.values())) {
      if (u.email === email) { found = u as StoredUser; break; }
    }

    if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await signToken({ id: found.id, email: found.email });
    const { passwordHash: _pw, ...user } = found; // eslint-disable-line @typescript-eslint/no-unused-vars

    return NextResponse.json({ token, user });
  } catch {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
