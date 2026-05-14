import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { users } from '@/lib/store';
import { signToken } from '@/lib/auth';

const schema = z
  .object({
    fullName:        z.string().min(3, 'Name must be at least 3 characters'),
    phone:           z.string().regex(/^(\+251|0)[79]\d{8}$/, 'Invalid Ethiopian phone number'),
    email:           z.string().email('Invalid email address'),
    plateNumber:     z.string().min(4, 'Invalid plate number'),
    vehicleType:     z.enum(['sedan', 'suv', 'truck', 'motorcycle', 'van']),
    licenseNumber:   z.string().min(5, 'Invalid license number'),
    password:        z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const summary = parsed.error.issues
        .map((i) => {
          const path = i.path.length ? `${i.path.join('.')}: ` : '';
          return `${path}${i.message}`;
        })
        .join(' ');
      return NextResponse.json(
        { error: summary || 'Validation failed', issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { fullName, phone, email, plateNumber, vehicleType, licenseNumber, password } =
      parsed.data;

    // Check duplicate email
    for (const u of Array.from(users.values())) {
      if (u.email === email) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
    }

    const id           = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);
    const now          = new Date().toISOString();

    users.set(id, {
      id, fullName, email, phone,
      vehicleInfo: { plateNumber, vehicleType, licenseNumber },
      createdAt:   now,
      passwordHash,
    });

    const token = await signToken({ id, email });
    const stored = users.get(id)!;
    const { passwordHash: _pw, ...user } = stored; // eslint-disable-line @typescript-eslint/no-unused-vars

    return NextResponse.json({ token, user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
