import { NextResponse } from 'next/server';

/**
 * Log a server-side error with context and return a generic, safe JSON error
 * response. Raw database / provider messages are never sent to the client —
 * they are logged server-side only.
 */
export function serverError(
  context: string,
  err: unknown,
  message = 'Something went wrong. Please try again.',
  status = 500
): NextResponse {
  console.error(`[${context}]`, err);
  return NextResponse.json({ error: message }, { status });
}
