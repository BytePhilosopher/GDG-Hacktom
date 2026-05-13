import { Station } from '@/types';
import { MOCK_STATIONS } from '@/lib/mockData';
import { calculateDistance as calcDist } from '@/lib/utils';

export class StationService {
  async getNearbyStations(lat: number, lng: number, radius: number = 10): Promise<Station[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return MOCK_STATIONS.map((station) => ({
      ...station,
      distance: parseFloat(
        calcDist(lat, lng, station.location.lat, station.location.lng).toFixed(1)
      ),
    })).sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  async getStationById(id: string): Promise<Station> {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const station = MOCK_STATIONS.find((s) => s.id === id);
    if (!station) throw new Error('Station not found');
    return station;
  }
}

export const stationService = new StationService();
