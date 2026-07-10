/**
 * Returns true when real Supabase credentials are present in the environment.
 * Used by route handlers to return a clear 503 instead of a cryptic 500
 * when the project hasn't been connected to Supabase yet.
 */
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return (
    url.startsWith('https://') &&
    !url.includes('placeholder') &&
    anonKey.length > 20 &&
    !anonKey.includes('placeholder') &&
    // Almost every route uses the service-role (admin) client, so require it
    // here too — otherwise the guard passes and the admin proxy throws a 500.
    serviceKey.length > 20 &&
    !serviceKey.includes('placeholder')
  );
}

export const SUPABASE_NOT_CONFIGURED = {
  error:
    'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env.local',
  docs: 'https://supabase.com/dashboard → Project Settings → API',
} as const;
