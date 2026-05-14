import { NextResponse } from 'next/server';
import { z } from 'zod';
import { adminClient } from '@/lib/supabase/admin';
import { checkSupabase } from '@/lib/supabase/guard';

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

export async function POST(request: Request) {
  const guard = checkSupabase();
  if (guard) return guard;

  try {
    const body   = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      const summary = parsed.error.issues
        .map((i) => `${i.path.length ? i.path.join('.') + ': ' : ''}${i.message}`)
        .join(' ');
      return NextResponse.json({ error: summary }, { status: 400 });
    }

    const { fullName, phone, email, plateNumber, vehicleType, licenseNumber, password } =
      parsed.data;

    // Use admin.createUser — bypasses the trigger entirely and auto-confirms email
    // so the user can log in immediately without email verification.
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone, role: 'driver' },
    });

    if (authError) {
      // Supabase returns a generic message for duplicate emails
      if (
        authError.message.toLowerCase().includes('already registered') ||
        authError.message.toLowerCase().includes('already been registered') ||
        authError.message.toLowerCase().includes('duplicate') ||
        authError.message.toLowerCase().includes('unique')
      ) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
      }
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'Registration failed — no user returned' }, { status: 500 });
    }

    const userId = authData.user.id;

    // Wait briefly for the trigger to fire, then upsert to handle both cases:
    // 1. Trigger already created the profile row → upsert is a no-op
    // 2. Trigger hasn't fired yet → upsert creates it
    await new Promise(r => setTimeout(r, 300));

    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert(
        { id: userId, full_name: fullName, phone, role: 'driver' },
        { onConflict: 'id' }
      );

    if (profileError) {
      // Roll back auth user to keep DB consistent
      await adminClient.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Profile creation failed: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Insert vehicle record
    const { error: vehicleError } = await adminClient.from('vehicles').insert({
      user_id:        userId,
      plate_number:   plateNumber,
      vehicle_type:   vehicleType,
      license_number: licenseNumber,
    });

    if (vehicleError) {
      // Roll back both
      await adminClient.from('profiles').delete().eq('id', userId);
      await adminClient.auth.admin.deleteUser(userId);
      return NextResponse.json(
        { error: `Vehicle record failed: ${vehicleError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, userId }, { status: 201 });
  } catch (err) {
    console.error('[register] unexpected error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
