import { Station } from '@/types';
import { calculateDistance } from '@/lib/utils';

// ─── Mock Station Data ────────────────────────────────────────────────────────
// Swap getters with real API calls when backend is ready:
//   const { data } = await api.get<Station[]>('/stations/nearby', { params: { lat, lng, radius } });

const MOCK_STATIONS: Station[] = [
  {
    id: 'station-1',
    name: 'Total Station — Bole',
    location: { lat: 9.0105, lng: 38.7636, address: 'Bole, Addis Ababa' },
    workingHours: 'Open 24/7',
    imageUrl: 'https://images.unsplash.com/photo-1545262810-a9b8f4c5f5e5?w=800',
    fuels: [
      { type: 'Benzene',  available: true,  remainingQuantity: 2400, pricePerLiter: 52.66 },
      { type: 'Diesel',   available: true,  remainingQuantity: 800,  pricePerLiter: 49.50 },
      { type: 'Kerosene', available: true,  remainingQuantity: 100,  pricePerLiter: 38.00 },
    ],
    queueSize: 8,
  },
  {
    id: 'station-2',
    name: 'NOC Station — Kazanchis',
    location: { lat: 9.0227, lng: 38.7614, address: 'Kazanchis, Addis Ababa' },
    workingHours: 'Mon–Sat 6am–10pm',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800',
    fuels: [
      { type: 'Benzene',  available: true,  remainingQuantity: 1500, pricePerLiter: 52.66 },
      { type: 'Diesel',   available: false, remainingQuantity: 0,    pricePerLiter: 49.50 },
      { type: 'Kerosene', available: true,  remainingQuantity: 800,  pricePerLiter: 38.00 },
    ],
    queueSize: 12,
  },
  {
    id: 'station-3',
    name: 'Oilibya — Megenagna',
    location: { lat: 9.0348, lng: 38.7714, address: 'Megenagna, Addis Ababa' },
    workingHours: 'Open 24/7',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    fuels: [
      { type: 'Benzene', available: true, remainingQuantity: 4000, pricePerLiter: 52.66 },
      { type: 'Diesel',  available: true, remainingQuantity: 3500, pricePerLiter: 49.50 },
    ],
    queueSize: 3,
  },
  {
    id: 'station-4',
    name: 'Total Station — Piassa',
    location: { lat: 9.0348, lng: 38.7469, address: 'Piassa, Addis Ababa' },
    workingHours: 'Open 5am–11pm',
    imageUrl: 'https://images.unsplash.com/photo-1545262810-a9b8f4c5f5e5?w=800',
    fuels: [
      { type: 'Benzene',  available: false, remainingQuantity: 0,    pricePerLiter: 52.66 },
      { type: 'Diesel',   available: true,  remainingQuantity: 1800, pricePerLiter: 49.50 },
      { type: 'Kerosene', available: true,  remainingQuantity: 600,  pricePerLiter: 38.00 },
    ],
    queueSize: 5,
  },
  {
    id: 'station-5',
    name: 'Kobil — CMC Road',
    location: { lat: 9.0456, lng: 38.8012, address: 'CMC Road, Addis Ababa' },
    workingHours: 'Open 24/7',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
    fuels: [
      { type: 'Benzene', available: true, remainingQuantity: 2200, pricePerLiter: 52.66 },
      { type: 'Diesel',  available: true, remainingQuantity: 1900, pricePerLiter: 49.50 },
    ],
    queueSize: 2,
  },
];

// ─── Station Service ──────────────────────────────────────────────────────────

class StationService {
  /**
   * Get stations within radius (meters) of a coordinate, sorted by distance.
   * Future: GET /api/stations/nearby?lat=&lng=&radius=
   */
  async getNearbyStations(lat: number, lng: number, radius = 10000): Promise<Station[]> {
    await new Promise((r) => setTimeout(r, 300));

    return MOCK_STATIONS
      .map((s) => ({
        ...s,
        distance: calculateDistance(lat, lng, s.location.lat, s.location.lng),
      }))
      .filter((s) => s.distance! * 1000 <= radius)
      .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
  }

  /**
   * Get a single station by ID.
   * Future: GET /api/stations/:id
   */
  async getStationById(id: string): Promise<Station> {
    await new Promise((r) => setTimeout(r, 200));

    const station = MOCK_STATIONS.find((s) => s.id === id);
    if (!station) throw new Error(`Station "${id}" not found`);
    return { ...station };
  }

  /**
   * Get all stations (for admin or search).
   * Future: GET /api/stations
   */
  async getAllStations(): Promise<Station[]> {
    await new Promise((r) => setTimeout(r, 200));
    return [...MOCK_STATIONS];
  }
}

export const stationService = new StationService();
