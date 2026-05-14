import api from '@/lib/axios';
import { Station } from '@/types';

class StationService {
  async getNearbyStations(lat: number, lng: number, radius = 10000): Promise<Station[]> {
    const { data } = await api.get<Station[]>('/stations/nearby', {
      params: { lat, lng, radius },
    });
    return data;
  }

  async getStationById(id: string): Promise<Station> {
    const { data } = await api.get<Station>(`/stations/${id}`);
    return data;
  }
}

export const stationService = new StationService();
