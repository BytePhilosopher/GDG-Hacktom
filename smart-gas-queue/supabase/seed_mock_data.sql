-- =============================================================================
-- FuelQ — Mock stations + fuels + optional nearby RPC (Supabase / PostgreSQL)
-- =============================================================================
-- Run in: Supabase Dashboard → SQL Editor (or `psql` against your project DB).
--
-- Prerequisites:
--   • Tables `stations` and `station_fuels` exist (see SYSTEM_WORKFLOW.md schema).
--   • Row Level Security: allow `anon` + `authenticated` to SELECT stations and
--     station_fuels (or use service role only from API — your app reads via anon).
--   • If `fuel_type` is a Postgres ENUM, change inserts to e.g. 'Benzene'::fuel_type.
--
-- What this does:
--   1) CREATE OR REPLACE `get_nearby_stations` (Haversine, meters). Skip (1) if you
--      already use a PostGIS version with the same signature.
--   2) Removes previous mock rows (station names prefixed with "FuelQ Demo —").
--   3) Inserts 5 stations around Addis Ababa + 3 fuel rows each.
--
-- After seeding, the home map (default Addis fallback ~9.005, 38.764) should list
-- these stations in the “Nearby” strip and show pins when Google Maps is configured.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) RPC: nearby stations within radius (meters), sorted by distance
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_nearby_stations(
  user_lat double precision,
  user_lng double precision,
  radius_meters double precision DEFAULT 10000
)
RETURNS TABLE (
  id uuid,
  name text,
  address text,
  lat double precision,
  lng double precision,
  working_hours text,
  image_url text,
  distance_meters double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT
    s.id,
    s.name::text,
    s.address::text,
    s.lat::double precision,
    s.lng::double precision,
    s.working_hours::text,
    s.image_url::text,
    (
      6371000.0 * acos(
        LEAST(
          1.0,
          GREATEST(
            -1.0,
            cos(radians(user_lat)) * cos(radians(s.lat::double precision))
            * cos(radians(s.lng::double precision) - radians(user_lng))
            + sin(radians(user_lat)) * sin(radians(s.lat::double precision))
          )
        )
      )
    )::double precision AS distance_meters
  FROM public.stations s
  WHERE s.is_active IS TRUE
    AND (
      6371000.0 * acos(
        LEAST(
          1.0,
          GREATEST(
            -1.0,
            cos(radians(user_lat)) * cos(radians(s.lat::double precision))
            * cos(radians(s.lng::double precision) - radians(user_lng))
            + sin(radians(user_lat)) * sin(radians(s.lat::double precision))
          )
        )
      )
    ) <= radius_meters
  ORDER BY distance_meters ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_nearby_stations(double precision, double precision, double precision) TO anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- 2) Remove old mock data (safe to re-run)
-- -----------------------------------------------------------------------------
DELETE FROM public.station_fuels
WHERE station_id IN (
  SELECT id FROM public.stations WHERE name LIKE 'FuelQ Demo —%'
);

DELETE FROM public.stations
WHERE name LIKE 'FuelQ Demo —%';

-- -----------------------------------------------------------------------------
-- 3) Insert stations (Addis Ababa cluster — within ~10 km of city center)
-- -----------------------------------------------------------------------------
INSERT INTO public.stations (id, name, address, lat, lng, working_hours, image_url, is_active)
VALUES
  (
    'a1000000-0000-4000-8000-000000000001'::uuid,
    'FuelQ Demo — Bole Terminal',
    'Bole, Addis Ababa (near Bole International Airport)',
    9.0225000,
    38.7898000,
    '24/7',
    'https://images.unsplash.com/photo-1545232979-8bf68ee9b1af?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    'a1000000-0000-4000-8000-000000000002'::uuid,
    'FuelQ Demo — Mexico Square',
    'Mexico Square, Kirkos, Addis Ababa',
    9.0102000,
    38.7614000,
    '05:00 – 23:00',
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    'a1000000-0000-4000-8000-000000000003'::uuid,
    'FuelQ Demo — Piazza',
    'Piazza / Arada, Addis Ababa',
    9.0331000,
    38.7489000,
    '06:00 – 22:00',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    'a1000000-0000-4000-8000-000000000004'::uuid,
    'FuelQ Demo — Megenagna',
    'Megenagna, Yeka, Addis Ababa',
    9.0462000,
    38.7723000,
    '24/7',
    'https://images.unsplash.com/photo-1504222490345-c075b6008014?auto=format&fit=crop&w=1200&q=80',
    true
  ),
  (
    'a1000000-0000-4000-8000-000000000005'::uuid,
    'FuelQ Demo — Sarbet',
    'Sarbet / Nifas Silk, Addis Ababa',
    8.9968000,
    38.7256000,
    '06:00 – 21:30',
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    true
  );

-- -----------------------------------------------------------------------------
-- 4) Fuels per station (types must match app: Benzene, Diesel, Kerosene)
-- -----------------------------------------------------------------------------
INSERT INTO public.station_fuels (station_id, fuel_type, available, stock_liters, price_per_liter)
VALUES
  -- Station 1
  ('a1000000-0000-4000-8000-000000000001'::uuid, 'Benzene', true, 18500.00, 78.50),
  ('a1000000-0000-4000-8000-000000000001'::uuid, 'Diesel', true, 22000.00, 76.00),
  ('a1000000-0000-4000-8000-000000000001'::uuid, 'Kerosene', true, 4200.00, 71.25),
  -- Station 2
  ('a1000000-0000-4000-8000-000000000002'::uuid, 'Benzene', true, 9200.00, 77.90),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 'Diesel', true, 15400.00, 75.50),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 'Kerosene', false, 180.00, 70.00),
  -- Station 3
  ('a1000000-0000-4000-8000-000000000003'::uuid, 'Benzene', true, 5400.00, 79.00),
  ('a1000000-0000-4000-8000-000000000003'::uuid, 'Diesel', true, 11200.00, 76.25),
  ('a1000000-0000-4000-8000-000000000003'::uuid, 'Kerosene', true, 2600.00, 72.00),
  -- Station 4
  ('a1000000-0000-4000-8000-000000000004'::uuid, 'Benzene', true, 30100.00, 77.25),
  ('a1000000-0000-4000-8000-000000000004'::uuid, 'Diesel', true, 28500.00, 74.90),
  ('a1000000-0000-4000-8000-000000000004'::uuid, 'Kerosene', true, 5100.00, 71.50),
  -- Station 5
  ('a1000000-0000-4000-8000-000000000005'::uuid, 'Benzene', true, 7800.00, 78.00),
  ('a1000000-0000-4000-8000-000000000005'::uuid, 'Diesel', true, 9600.00, 75.75),
  ('a1000000-0000-4000-8000-000000000005'::uuid, 'Kerosene', true, 1950.00, 70.50);

-- -----------------------------------------------------------------------------
-- 5) Optional: link a station admin user to Station 1
-- -----------------------------------------------------------------------------
-- Uncomment and replace <AUTH_USER_UUID> with a real `auth.users.id` after you
-- create the user in Authentication → Users (role station_admin in `profiles`).
--
-- INSERT INTO public.profiles (id, full_name, phone, role, station_id)
-- VALUES (
--   '<AUTH_USER_UUID>'::uuid,
--   'Demo Station Admin',
--   '+251911000000',
--   'station_admin',
--   'a1000000-0000-4000-8000-000000000001'::uuid
-- )
-- ON CONFLICT (id) DO UPDATE SET
--   role = EXCLUDED.role,
--   station_id = EXCLUDED.station_id,
--   full_name = EXCLUDED.full_name,
--   phone = EXCLUDED.phone;
