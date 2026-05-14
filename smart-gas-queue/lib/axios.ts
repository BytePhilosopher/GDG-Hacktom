import axios from 'axios';

/**
 * Browser: always same-origin `/api` so requests work whether the user opens the app via
 * `localhost`, `127.0.0.1`, or LAN IP (avoids cross-origin failures when NEXT_PUBLIC_API_URL
 * is hard-coded to another host).
 *
 * Server (RSC / route handlers calling this app): use NEXT_PUBLIC_APP_URL + `/api`.
 */
function resolveApiBaseURL(): string {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  const root = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  return `${root}/api`;
}

function readAuthHeader(config: { headers?: unknown }): string | undefined {
  const h = config.headers;
  if (!h || typeof h !== 'object') return undefined;
  if ('get' in h && typeof (h as { get: (k: string) => unknown }).get === 'function') {
    const ax = h as { get: (k: string) => string | undefined };
    return ax.get('Authorization') ?? ax.get('authorization');
  }
  const rec = h as Record<string, string | undefined>;
  return rec.Authorization ?? rec.authorization;
}

const api = axios.create({
  baseURL: resolveApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT except on credential endpoints (stale tokens break some setups).
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const path = `${config.baseURL ?? ''}${config.url ?? ''}`;
      const isCredential = path.includes('/auth/login') || path.includes('/auth/register');
      if (!isCredential) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — redirect only when an *authenticated* call fails (not wrong login).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status as number | undefined;
    const url = String(error.config?.url ?? '');
    const hadAuthHeader = Boolean(readAuthHeader(error.config ?? {}));

    if (status === 401 && typeof window !== 'undefined') {
      const isCredentialAttempt =
        url.includes('/auth/login') || url.includes('/auth/register');
      if (!isCredentialAttempt && hadAuthHeader) {
        localStorage.removeItem('auth_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
