import { QueueEntry, AdminFuel, StationStats } from '@/types/admin';

// ─── Mock Queue Data ──────────────────────────────────────────────────────────

export const mockQueueEntries: QueueEntry[] = [
  { id: 'q1', position: 1, driverName: 'Abebe Kebede',   plateNumber: 'AA-1234', fuelType: 'Benzene',  liters: 30, totalPrice: 3600,   advancePaid: 900,     joinedAt: new Date(), status: 'waiting' },
  { id: 'q2', position: 2, driverName: 'Sara Mulugeta',  plateNumber: 'AA-5678', fuelType: 'Diesel',   liters: 50, totalPrice: 5750,   advancePaid: 1437.5,  joinedAt: new Date(), status: 'waiting' },
  { id: 'q3', position: 3, driverName: 'Yonas Tesfaye',  plateNumber: 'OR-9012', fuelType: 'Benzene',  liters: 20, totalPrice: 2400,   advancePaid: 600,     joinedAt: new Date(), status: 'waiting' },
  { id: 'q4', position: 4, driverName: 'Hana Bekele',    plateNumber: 'AA-3456', fuelType: 'Diesel',   liters: 40, totalPrice: 4600,   advancePaid: 1150,    joinedAt: new Date(), status: 'waiting' },
  { id: 'q5', position: 5, driverName: 'Dawit Girma',    plateNumber: 'AA-7890', fuelType: 'Benzene',  liters: 60, totalPrice: 7200,   advancePaid: 1800,    joinedAt: new Date(), status: 'waiting' },
  { id: 'q6', position: 6, driverName: 'Meron Alemu',    plateNumber: 'AA-2345', fuelType: 'Kerosene', liters: 25, totalPrice: 2375,   advancePaid: 593.75,  joinedAt: new Date(), status: 'waiting' },
  { id: 'q7', position: 7, driverName: 'Biruk Haile',    plateNumber: 'OR-6789', fuelType: 'Benzene',  liters: 45, totalPrice: 5400,   advancePaid: 1350,    joinedAt: new Date(), status: 'waiting' },
  { id: 'q8', position: 8, driverName: 'Tigist Worku',   plateNumber: 'AA-0123', fuelType: 'Diesel',   liters: 35, totalPrice: 4025,   advancePaid: 1006.25, joinedAt: new Date(), status: 'waiting' },
];

// ─── Mock Fuel Data ───────────────────────────────────────────────────────────

export const mockFuels: AdminFuel[] = [
  { type: 'Benzene',  available: true, stockLiters: 2400, pricePerLiter: 120 },
  { type: 'Diesel',   available: true, stockLiters: 800,  pricePerLiter: 115 },
  { type: 'Kerosene', available: true, stockLiters: 100,  pricePerLiter: 95  },
];

// ─── Service (swap with real API calls when backend is ready) ─────────────────

export const adminService = {
  /**
   * GET /api/admin/queue
   */
  async getQueue(): Promise<QueueEntry[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...mockQueueEntries];
  },

  /**
   * GET /api/admin/fuels
   */
  async getFuels(): Promise<AdminFuel[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...mockFuels];
  },

  /**
   * GET /api/admin/stats
   */
  async getStats(): Promise<StationStats> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      totalInQueue: mockQueueEntries.filter((e) => e.status === 'waiting').length,
      completedToday: 5,
      totalFuelRemaining: mockFuels.reduce((sum, f) => sum + f.stockLiters, 0),
    };
  },

  /**
   * PATCH /api/admin/queue/:id/complete
   */
  async completeDriver(id: string): Promise<void> {
    console.log('[adminService] complete driver:', id);
  },

  /**
   * PATCH /api/admin/queue/:id/skip
   */
  async skipDriver(id: string): Promise<void> {
    console.log('[adminService] skip driver:', id);
  },

  /**
   * DELETE /api/admin/queue/:id
   */
  async removeDriver(id: string): Promise<void> {
    console.log('[adminService] remove driver:', id);
  },

  /**
   * PATCH /api/admin/fuels/:type
   */
  async updateFuel(fuel: AdminFuel): Promise<void> {
    console.log('[adminService] update fuel:', fuel);
  },
};
