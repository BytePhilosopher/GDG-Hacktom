import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkSupabase } from '@/lib/supabase/guard';

export async function POST() {
  const guard = checkSupabase();
  if (guard) return guard;
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
