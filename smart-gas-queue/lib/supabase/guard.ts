import { NextResponse } from 'next/server';
import { isSupabaseConfigured, SUPABASE_NOT_CONFIGURED } from './config';

/**
 * Call at the top of every route handler.
 * Returns a 503 response if Supabase isn't configured, otherwise null.
 *
 * Usage:
 *   const guard = checkSupabase();
 *   if (guard) return guard;
 */
export function checkSupabase(): NextResponse | null {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(SUPABASE_NOT_CONFIGURED, { status: 503 });
  }
  return null;
}
