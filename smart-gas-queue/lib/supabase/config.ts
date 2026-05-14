/**
 * Returns true when real Supabase credentials are present in the environment.
 * Used by route handlers to return a clear 503 instead of a cryptic 500
 * when the project hasn't been connected to Supabase yet.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  return (
    url.startsWith('https://') &&
    !url.includes('placeholder') &&
    key.length > 20 &&
    !key.includes('placeholder')
  );
}

export const SUPABASE_NOT_CONFIGURED = {
  error: 'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env.local',
  docs:  'https://supabase.com/dashboard → Project Settings → API',
} as const;
