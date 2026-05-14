import { QueueEntry, AdminFuel, StationStats } from '@/types/admin';

// ─── Admin Service ────────────────────────────────────────────────────────────
// All functions call real API routes backed by Supabase.
// The function signatures are identical to the mock version so no UI code changes.

export const adminService = {
  async getQueue(): Promise<QueueEntry[]> {
    const res = await fetch('/api/admin/queue');
    if (!res.ok) throw new Error('Failed to fetch queue');
    return res.json();
  },

  async getFuels(): Promise<AdminFuel[]> {
    const res = await fetch('/api/admin/fuels');
    if (!res.ok) throw new Error('Failed to fetch fuels');
    return res.json();
  },

  async getStats(): Promise<StationStats> {
    const res = await fetch('/api/admin/stats');
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
  },

  async completeDriver(id: string): Promise<void> {
    const res = await fetch(`/api/admin/queue/${id}/complete`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to complete driver');
  },

  async skipDriver(id: string): Promise<void> {
    const res = await fetch(`/api/admin/queue/${id}/skip`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to skip driver');
  },

  async removeDriver(id: string): Promise<void> {
    const res = await fetch(`/api/admin/queue/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to remove driver');
  },

  async updateFuel(fuel: AdminFuel): Promise<void> {
    const res = await fetch(`/api/admin/fuels/${encodeURIComponent(fuel.type)}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        stockLiters:   fuel.stockLiters,
        pricePerLiter: fuel.pricePerLiter,
        available:     fuel.available,
      }),
    });
    if (!res.ok) throw new Error('Failed to update fuel');
  },
};
