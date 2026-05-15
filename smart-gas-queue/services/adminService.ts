import { QueueEntry, AdminFuel, StationStats } from '@/types/admin';

const cred: RequestInit = { credentials: 'include' };

async function apiError(res: Response): Promise<string> {
  try {
    const j = (await res.json()) as { error?: unknown };
    if (typeof j?.error === 'string') return j.error;
  } catch {
    /* non-JSON body */
  }
  return `Request failed (${res.status})`;
}

// ─── Admin Service ────────────────────────────────────────────────────────────
// All functions call real API routes backed by Supabase (session cookies).

export const adminService = {
  async getQueue(): Promise<QueueEntry[]> {
    const res = await fetch('/api/admin/queue', cred);
    if (!res.ok) throw new Error(await apiError(res));
    return res.json();
  },

  async getFuels(): Promise<AdminFuel[]> {
    const res = await fetch('/api/admin/fuels', cred);
    if (!res.ok) throw new Error(await apiError(res));
    return res.json();
  },

  async getStats(): Promise<StationStats> {
    const res = await fetch('/api/admin/stats', cred);
    if (!res.ok) throw new Error(await apiError(res));
    return res.json();
  },

  async completeDriver(id: string): Promise<void> {
    const res = await fetch(`/api/admin/queue/${id}/complete`, { ...cred, method: 'PATCH' });
    if (!res.ok) throw new Error(await apiError(res));
  },

  async skipDriver(id: string): Promise<void> {
    const res = await fetch(`/api/admin/queue/${id}/skip`, { ...cred, method: 'PATCH' });
    if (!res.ok) throw new Error(await apiError(res));
  },

  async removeDriver(id: string): Promise<void> {
    const res = await fetch(`/api/admin/queue/${id}`, { ...cred, method: 'DELETE' });
    if (!res.ok) throw new Error(await apiError(res));
  },

  async updateFuel(fuel: AdminFuel): Promise<void> {
    const res = await fetch(`/api/admin/fuels/${encodeURIComponent(fuel.type)}`, {
      ...cred,
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        stockLiters:   fuel.stockLiters,
        pricePerLiter: fuel.pricePerLiter,
        available:     fuel.available,
      }),
    });
    if (!res.ok) throw new Error(await apiError(res));
  },
};
