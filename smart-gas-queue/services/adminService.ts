import { AdminUser, QueueEntry, AdminFuel, StationStats } from '@/types/admin';

// ─── Mock Credentials ────────────────────────────────────────────────────────
export const MOCK_ADMIN_CREDENTIALS = {
  email: 'admin@totalstation.com',
  password: 'admin123',
};

export const MOCK_ADMIN_USER: AdminUser = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@totalstation.com',
  stationId: 'station-bole-1',
  stationName: 'Total Station — Bole',
};

// ─── Mock Queue Data ─────────────────────────────────────────────────────────
export const mockQueueEntries: QueueEntry[] = [
  {
    id: 'q1',
    position: 1,
    driverName: 'Abebe Kebede',
    plateNumber: 'AA-1234',
    fuelType: 'Benzene',
    liters: 30,
    totalPrice: 3600,
    advancePaid: 900,
    joinedAt: new Date(),
    status: 'waiting',
  },
  {
    id: 'q2',
    position: 2,
    driverName: 'Sara Mulugeta',
    plateNumber: 'AA-5678',
    fuelType: 'Diesel',
    liters: 50,
    totalPrice: 5750,
    advancePaid: 1437.5,
    joinedAt: new Date(),
    status: 'waiting',
  },
  {
    id: 'q3',
    position: 3,
    driverName: 'Yonas Tesfaye',
    plateNumber: 'OR-9012',
    fuelType: 'Benzene',
    liters: 20,
    totalPrice: 2400,
    advancePaid: 600,
    joinedAt: new Date(),
    status: 'waiting',
  },
  {
    id: 'q4',
    position: 4,
    driverName: 'Hana Bekele',
    plateNumber: 'AA-3456',
    fuelType: 'Diesel',
    liters: 40,
    totalPrice: 4600,
    advancePaid: 1150,
    joinedAt: new Date(),
    status: 'waiting',
  },
  {
    id: 'q5',
    position: 5,
    driverName: 'Dawit Girma',
    plateNumber: 'AA-7890',
    fuelType: 'Benzene',
    liters: 60,
    totalPrice: 7200,
    advancePaid: 1800,
    joinedAt: new Date(),
    status: 'waiting',
  },
  {
    id: 'q6',
    position: 6,
    driverName: 'Meron Alemu',
    plateNumber: 'AA-2345',
    fuelType: 'Kerosene',
    liters: 25,
    totalPrice: 2375,
    advancePaid: 593.75,
    joinedAt: new Date(),
    status: 'waiting',
  },
  {
    id: 'q7',
    position: 7,
    driverName: 'Biruk Haile',
    plateNumber: 'OR-6789',
    fuelType: 'Benzene',
    liters: 35,
    totalPrice: 4200,
    advancePaid: 1050,
    joinedAt: new Date(),
    status: 'waiting',
  },
  {
    id: 'q8',
    position: 8,
    driverName: 'Tigist Worku',
    plateNumber: 'AA-4567',
    fuelType: 'Diesel',
    liters: 45,
    totalPrice: 5175,
    advancePaid: 1293.75,
    joinedAt: new Date(),
    status: 'waiting',
  },
];

// ─── Mock Fuel Data ───────────────────────────────────────────────────────────
export const mockFuels: AdminFuel[] = [
  { type: 'Benzene', available: true, stockLiters: 2400, pricePerLiter: 120 },
  { type: 'Diesel', available: true, stockLiters: 800, pricePerLiter: 115 },
  { type: 'Kerosene', available: true, stockLiters: 100, pricePerLiter: 95 },
];

// ─── Service Functions (swap with real API calls later) ───────────────────────

export const adminService = {
  /**
   * Authenticate admin user
   * Future: POST /api/admin/auth/login
   */
  async login(email: string, password: string): Promise<{ user: AdminUser; token: string }> {
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    if (
      email === MOCK_ADMIN_CREDENTIALS.email &&
      password === MOCK_ADMIN_CREDENTIALS.password
    ) {
      return { user: MOCK_ADMIN_USER, token: 'mock-admin-token-xyz' };
    }
    throw new Error('Invalid email or password');
  },

  /**
   * Verify stored admin token
   * Future: GET /api/admin/auth/me
   */
  async verifyToken(token: string): Promise<AdminUser> {
    await new Promise((r) => setTimeout(r, 200));
    if (token === 'mock-admin-token-xyz') return MOCK_ADMIN_USER;
    throw new Error('Invalid token');
  },

  /**
   * Get live queue for a station
   * Future: GET /api/admin/stations/:stationId/queue
   */
  async getQueue(_stationId: string): Promise<QueueEntry[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...mockQueueEntries];
  },

  /**
   * Mark driver as completed (served)
   * Future: PATCH /api/admin/queue/:entryId/complete
   */
  async completeEntry(entryId: string): Promise<void> {
    console.log('[adminService] complete entry:', entryId);
    // Future: await api.patch(`/admin/queue/${entryId}/complete`);
  },

  /**
   * Skip driver to end of queue
   * Future: PATCH /api/admin/queue/:entryId/skip
   */
  async skipEntry(entryId: string): Promise<void> {
    console.log('[adminService] skip entry:', entryId);
    // Future: await api.patch(`/admin/queue/${entryId}/skip`);
  },

  /**
   * Remove driver from queue
   * Future: DELETE /api/admin/queue/:entryId
   */
  async removeEntry(entryId: string): Promise<void> {
    console.log('[adminService] remove entry:', entryId);
    // Future: await api.delete(`/admin/queue/${entryId}`);
  },

  /**
   * Get fuel inventory for a station
   * Future: GET /api/admin/stations/:stationId/fuels
   */
  async getFuels(_stationId: string): Promise<AdminFuel[]> {
    await new Promise((r) => setTimeout(r, 300));
    return [...mockFuels];
  },

  /**
   * Update fuel stock/price/availability
   * Future: PATCH /api/admin/stations/:stationId/fuels/:fuelType
   */
  async updateFuel(
    _stationId: string,
    fuelType: string,
    data: Partial<AdminFuel>
  ): Promise<void> {
    console.log('[adminService] update fuel:', fuelType, data);
    // Future: await api.patch(`/admin/stations/${_stationId}/fuels/${fuelType}`, data);
  },

  /**
   * Get station stats
   * Future: GET /api/admin/stations/:stationId/stats
   */
  async getStats(_stationId: string): Promise<StationStats> {
    await new Promise((r) => setTimeout(r, 200));
    return {
      totalInQueue: mockQueueEntries.filter((e) => e.status === 'waiting').length,
      completedToday: 5,
      totalFuelRemaining: mockFuels.reduce((sum, f) => sum + f.stockLiters, 0),
    };
  },
};
