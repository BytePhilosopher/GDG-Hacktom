'use client';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { GoogleMap, Marker, Circle, useJsApiLoader } from '@react-google-maps/api';
import { Fuel } from 'lucide-react';
import { LatLng, Station } from '@/types';

/** Support both common env names (Vercel / docs often use …API_KEY). */
export function getGoogleMapsBrowserKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    ''
  ).trim();
}

// ── Custom SVG marker icons (data URIs — no google.maps.* at module scope) ────

/**
 * Brand teardrop pin: red gradient (#EF4444→#B91C1C), white stroke, soft drop
 * shadow, with the lucide "fuel" pump glyph in white centered in the head.
 */
const STATION_PIN_URL = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54">
  <defs>
    <linearGradient id="pinGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#EF4444"/>
      <stop offset="1" stop-color="#B91C1C"/>
    </linearGradient>
    <filter id="pinShadow" x="-40%" y="-30%" width="180%" height="170%">
      <feDropShadow dx="0" dy="2.5" stdDeviation="2.5" flood-color="#7F1D1D" flood-opacity="0.35"/>
    </filter>
  </defs>
  <path filter="url(#pinShadow)" fill="url(#pinGrad)" stroke="#ffffff" stroke-width="2.5"
    d="M22 3C13.7 3 7 9.7 7 18c0 4.7 2.9 10.5 6 15.4 3.4 5.4 7.3 10.3 9 12.4 1.7-2.1 5.6-7 9-12.4 3.1-4.9 6-10.7 6-15.4C37 9.7 30.3 3 22 3z"/>
  <g transform="translate(13.9 9.9) scale(0.675)" fill="none" stroke="#ffffff"
    stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="3" x2="15" y1="22" y2="22"/>
    <line x1="4" x2="14" y1="9" y2="9"/>
    <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18"/>
    <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2 2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5"/>
  </g>
</svg>`
)}`;

/**
 * User location: solid blue dot with crisp white ring and a soft translucent
 * halo, center-anchored.
 */
const USER_DOT_URL = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
  <circle cx="24" cy="24" r="22" fill="#3B82F6" opacity="0.12"/>
  <circle cx="24" cy="24" r="14" fill="#3B82F6" opacity="0.16"/>
  <circle cx="24" cy="24" r="9" fill="#ffffff"/>
  <circle cx="24" cy="24" r="6.5" fill="#3B82F6"/>
</svg>`
)}`;

// ── Premium desaturated light map theme ────────────────────────────────────────
// Soft gray-beige landscape, white roads with subtle definition, hidden POI /
// transit clutter, light blue-gray water.
const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f4f2ee' }] },
  { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6f6d66' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#d8d4cb' }],
  },
  { featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#4b4a45' }],
  },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#eeeae2' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#e9e5dc' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#dcead9' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e9e5dd' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#8b8880' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fdfdfb' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f9f5ec' }] },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#e6dfd0' }],
  },
  { featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'simplified' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#ccdbe4' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#8ba0ae' }] },
];

interface MapContainerProps {
  center: LatLng;
  zoom?: number;
  userLocation: LatLng | null;
  stations: Station[];
  onStationClick: (station: Station) => void;
}

/** Loads Maps JS once via `useJsApiLoader` (avoids duplicate `LoadScript` issues in React 18 / App Router). */
function GoogleMapInner({
  apiKey,
  center,
  zoom,
  userLocation,
  stations,
  onStationClick,
}: MapContainerProps & { apiKey: string }) {
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'fuelq-google-maps',
    googleMapsApiKey: apiKey,
    version: 'weekly',
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.panTo(center);
  }, [center]);

  // google.maps.Size/Point may only be constructed once the Maps API is loaded.
  const stationIcon = useMemo<google.maps.Icon | undefined>(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google?.maps) return undefined;
    return {
      url: STATION_PIN_URL,
      scaledSize: new google.maps.Size(44, 54),
      anchor: new google.maps.Point(22, 51), // pin tip → bottom center
    };
  }, [isLoaded]);

  const userIcon = useMemo<google.maps.Icon | undefined>(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google?.maps) return undefined;
    return {
      url: USER_DOT_URL,
      scaledSize: new google.maps.Size(48, 48),
      anchor: new google.maps.Point(24, 24), // center-anchored
    };
  }, [isLoaded]);

  if (loadError) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-50 to-red-50 p-6">
        <div className="glass max-w-md rounded-2xl px-5 py-6 text-center shadow-card ring-1 ring-amber-500/20">
          <p className="text-sm font-bold tracking-tight text-gray-900">
            Could not load Google Maps
          </p>
          <p className="mt-2 text-xs leading-relaxed text-gray-600">
            Check that the <strong>Maps JavaScript API</strong> is enabled, billing is active, and
            this site&apos;s URL is allowed under{' '}
            <strong>Application restrictions → HTTP referrers</strong> for your browser key.
          </p>
          <p className="mt-3 break-all font-mono text-xs text-gray-500">{String(loadError)}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-primary-600/25" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
          </div>
          <p className="text-xs font-semibold tracking-tight text-white">Loading map…</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full"
      center={center}
      zoom={zoom}
      onLoad={onMapLoad}
      onUnmount={onMapUnmount}
      options={{
        styles: MAP_STYLES,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
      }}
    >
      {userLocation && (
        <>
          <Marker position={userLocation} icon={userIcon} zIndex={20} />
          <Circle
            center={userLocation}
            radius={100}
            options={{
              fillColor: '#3B82F6',
              fillOpacity: 0.08,
              strokeColor: '#3B82F6',
              strokeOpacity: 0.25,
              strokeWeight: 1,
            }}
          />
        </>
      )}

      {stations.map((station) => (
        <Marker
          key={station.id}
          position={station.location}
          onClick={() => onStationClick(station)}
          icon={stationIcon}
          title={station.name}
          zIndex={10}
        />
      ))}
    </GoogleMap>
  );
}

export function MapContainer(props: MapContainerProps) {
  const { center, zoom = 14, userLocation, stations, onStationClick } = props;
  const apiKey = getGoogleMapsBrowserKey();

  if (!apiKey) {
    return (
      <MockMap stations={stations} onStationClick={onStationClick} userLocation={userLocation} />
    );
  }

  return (
    <GoogleMapInner
      apiKey={apiKey}
      center={center}
      zoom={zoom}
      userLocation={userLocation}
      stations={stations}
      onStationClick={onStationClick}
    />
  );
}

// ── Fallback map rendered when no Google Maps API key is set ──────────────────
function MockMap({
  stations,
  onStationClick,
  userLocation,
}: {
  stations: Station[];
  onStationClick: (station: Station) => void;
  userLocation: LatLng | null;
}) {
  const markerPositions = [
    { left: '25%', top: '35%' },
    { left: '60%', top: '25%' },
    { left: '75%', top: '55%' },
    { left: '35%', top: '65%' },
    { left: '55%', top: '70%' },
  ];

  return (
    <div
      className="relative h-full w-full select-none overflow-hidden"
      style={{
        background: 'radial-gradient(120% 90% at 20% 10%, #fbfaf7 0%, #f4f2ee 45%, #e9edf2 100%)',
      }}
    >
      {/* Faint grid */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(100,105,115,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(100,105,115,0.07) 1px, transparent 1px)',
          backgroundSize: '5% 5%',
        }}
      />

      {/* Soft vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          background:
            'radial-gradient(90% 70% at 50% 50%, transparent 60%, rgba(30,41,59,0.05) 100%)',
        }}
      />

      {/* Simulated roads */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute h-2.5 rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-gray-950/[0.06]"
          style={{ top: '30%', left: '-2%', right: '-2%' }}
        />
        <div
          className="absolute h-2.5 rounded-full bg-white shadow-[0_1px_2px_rgba(15,23,42,0.08)] ring-1 ring-gray-950/[0.06]"
          style={{ top: '60%', left: '-2%', right: '-2%' }}
        />
        <div
          className="absolute w-2.5 rounded-full bg-white shadow-[1px_0_2px_rgba(15,23,42,0.08)] ring-1 ring-gray-950/[0.06]"
          style={{ left: '40%', top: '-2%', bottom: '-2%' }}
        />
        <div
          className="absolute w-2.5 rounded-full bg-white shadow-[1px_0_2px_rgba(15,23,42,0.08)] ring-1 ring-gray-950/[0.06]"
          style={{ left: '70%', top: '-2%', bottom: '-2%' }}
        />
      </div>

      {/* "No API key" label */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2">
        <div className="glass rounded-2xl px-4 py-2.5 text-center shadow-float ring-1 ring-gray-950/[0.06]">
          <p className="text-xs font-bold tracking-tight text-gray-900">Map Preview</p>
          <p className="mt-0.5 font-mono text-[11px] text-gray-500">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or NEXT_PUBLIC_GOOGLE_MAPS_KEY) for live map
          </p>
        </div>
      </div>

      {/* User location dot */}
      {userLocation && (
        <div
          className="absolute z-10"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}
        >
          <div className="relative h-4 w-4">
            <div className="h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
            <div className="absolute inset-0 h-4 w-4 animate-ping rounded-full bg-blue-400 opacity-60" />
          </div>
        </div>
      )}

      {/* Station markers */}
      {stations.map((station, index) => {
        const pos = markerPositions[index % markerPositions.length];
        return (
          <button
            key={station.id}
            className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
            style={pos}
            onClick={() => onStationClick(station)}
            aria-label={`Select ${station.name}`}
          >
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-gradient shadow-float ring-2 ring-white transition-transform duration-200 ease-premium group-hover:scale-110 group-focus-visible:scale-110">
                <Fuel className="text-white" size={18} strokeWidth={2.25} aria-hidden />
              </div>
              {/* Tooltip */}
              <div className="glass pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-900 opacity-0 shadow-float ring-1 ring-gray-950/[0.06] transition-opacity duration-200 ease-premium group-hover:opacity-100 group-focus-visible:opacity-100">
                {station.name}
                <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white/90" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
