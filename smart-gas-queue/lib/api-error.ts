import axios, { type AxiosError } from 'axios';

/** Readable message from API JSON `{ error: string | object }` or status codes. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const ax = error as AxiosError<{ error?: unknown }>;
  const raw = ax.response?.data?.error;

  if (typeof raw === 'string' && raw.trim()) return raw;

  if (raw && typeof raw === 'object') {
    const issues = (raw as { formErrors?: string[] }).formErrors;
    if (Array.isArray(issues) && issues[0]) return issues[0];
    try {
      const flat = JSON.stringify(raw);
      if (flat.length < 280) return flat;
    } catch {
      /* ignore */
    }
  }

  switch (ax.response?.status) {
    case 401:
      return 'Invalid email or password';
    case 403:
      return 'You do not have permission for this action';
    case 404:
      return 'Not found';
    case 409:
      return typeof raw === 'string' ? raw : 'This record already exists or conflicts with another.';
    case 422:
    case 400:
      return typeof raw === 'string' ? raw : 'Invalid request. Please check your input.';
    default:
      return fallback;
  }
}
