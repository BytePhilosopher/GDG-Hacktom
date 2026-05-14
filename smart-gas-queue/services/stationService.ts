import { createClient } from '@/lib/supabase/client';
import { Station, Fuel } from '@/types';

const supabase = createClient();

// ─── Shape helpers ────────────────────────────────────────────────────────────

interface RawFuel {
  fuel_type:       string;
  available:       boolean;
  stock_liters:    number;
  price_per_liter: number;
}

interface RawStation {
  id:            string;
  name:          string;
  address:       string;
  lat:           number;
  lng:           number;
  working_hours: string | null;
  image_url:     string | null;
  is_active:     boolean;
  station_fuels?: RawFuel[];
  distance_meters?: number;
}

function toStation(raw: RawStation, distanceKm?: number): Station {
  const fuels: Fuel[] = (raw.station_fuels ?? []).map((f) => ({
    type:              f.fuel_type as Fuel['type'],
    available:         f.available,
    remainingQuantity: f.stock_liters,
    pricePerLiter:     f.price_per_liter,
  }));

  return {
    id:           raw.id,
    name:         raw.name,
    location:     { lat: raw.lat, lng: raw.lng, address: raw.address },
    workingHours: raw.working_hours ?? '',
    imageUrl:     raw.image_url ?? '',
    fuels,
    distance:     distanceKm,
  };
}

// ─── Station Service ──────────────────────────────────────────────────────────

class StationService {
  /**
   * Get stations within radius (meters) of a coordinate, sorted by distance.
   * Uses the get_nearby_stations PostGIS RPC function.
   */
  async getNearbyStations(lat: number, lng: number, radius = 10000): Promise<Station[]> {
    const { data, error } = await supabase.rpc('get_nearby_stations', {
      user_lat:      lat,
      user_lng:      lng,
      radius_meters: radius,
    });

    if (error) throw new Error(error.message);

    // Fetch fuels for each station
    const stationIds = (data as RawStation[]).map((s) => s.id);
    const { data: fuels } = await supabase
      .from('station_fuels')
      .select('*')
      .in('station_id', stationIds);

    const fuelsByStation: Record<string, RawFuel[]> = {};
    for (const f of fuels ?? []) {
      if (!fuelsByStation[f.station_id]) fuelsByStation[f.station_id] = [];
      fuelsByStation[f.station_id].push(f);
    }

    return (data as (RawStation & { distance_meters: number })[]).map((s) =>
      toStation(
        { ...s, station_fuels: fuelsByStation[s.id] ?? [] },
        s.distance_meters / 1000
      )
    );
  }

  /**
   * Get a single station by ID with its fuels.
   */
  async getStationById(id: string): Promise<Station> {
    const { data, error } = await supabase
      .from('stations')
      .select('*, station_fuels(*)')
      .eq('id', id)
      .single();

    if (error || !data) throw new Error(`Station "${id}" not found`);
    return toStation(data as RawStation);
  }

  /**
   * Get all active stations.
   */
  async getAllStations(): Promise<Station[]> {
    const { data, error } = await supabase
      .from('stations')
      .select('*, station_fuels(*)')
      .eq('is_active', true)
      .order('name');

    if (error) throw new Error(error.message);
    return (data as RawStation[]).map((s) => toStation(s));
  }
}

export const stationService = new StationService();
