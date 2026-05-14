import { AxiosError } from 'axios';

type ErrorBody = {
  error?: string | Record<string, unknown>;
  message?: string;
};

/** Human-readable message from a failed API call (axios or thrown Error). */
export function getApiErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const status = err.response?.status;
    const body = err.response?.data as ErrorBody | undefined;

    if (typeof body?.error === 'string' && body.error.trim()) return body.error.trim();
    if (typeof body?.message === 'string' && body.message.trim()) return body.message.trim();

    if (status === 401) return 'Invalid email or password.';
    if (status === 409) return 'Email already registered.';
    if (status === 400) return 'Invalid request. Please check your input.';

    if (err.message?.startsWith('Network Error')) {
      return 'Network error — check your connection and that the app is running.';
    }
    return err.message || 'Request failed. Please try again.';
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}
