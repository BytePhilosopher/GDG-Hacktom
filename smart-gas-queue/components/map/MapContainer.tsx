'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { GoogleMap, Marker, Circle, useJsApiLoader } from '@react-google-maps/api';
import { LatLng, Station } from '@/types';

/** Support both common env names (Vercel / docs often use …API_KEY). */
export function getGoogleMapsBrowserKey(): string {
  return (
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    ''
  ).trim();
}

function circleSymbol(scale: number, fillColor: string, strokeColor = '#ffffff') {
  const gmaps = typeof window !== 'undefined' ? window.google?.maps : undefined;
  const Path = gmaps?.SymbolPath?.CIRCLE ?? 0;
  return {
    path: Path,
    scale,
    fillColor,
    fillOpacity: 1,
    strokeColor,
    strokeWeight: 2,
  };
}

const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e8f5' }] },
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

  if (loadError) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-amber-50 to-red-50 flex items-center justify-center p-6">
        <div className="max-w-md text-center rounded-xl border border-amber-200 bg-white/90 px-5 py-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Could not load Google Maps</p>
          <p className="text-xs text-gray-600 mt-2 leading-relaxed">
            Check that the <strong>Maps JavaScript API</strong> is enabled, billing is active, and this site&apos;s
            URL is allowed under <strong>Application restrictions → HTTP referrers</strong> for your browser key.
          </p>
          <p className="text-xs text-gray-500 mt-3 font-mono break-all">
            {String(loadError)}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-4 border-red-600/25" />
            <div className="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
          </div>
          <p className="text-xs font-medium text-slate-600">Loading map…</p>
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
          <Marker position={userLocation} icon={circleSymbol(8, '#3B82F6')} />
          <Circle
            center={userLocation}
            radius={100}
            options={{
              fillColor: '#3B82F6',
              fillOpacity: 0.1,
              strokeColor: '#3B82F6',
              strokeOpacity: 0.3,
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
          icon={circleSymbol(9, '#DC2626')}
          title={station.name}
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
      <MockMap
        stations={stations}
        onStationClick={onStationClick}
        userLocation={userLocation}
      />
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
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden select-none">
      {/* Grid lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`h${i}`} className="absolute w-full border-t border-gray-500" style={{ top: `${i * 5}%` }} />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={`v${i}`} className="absolute h-full border-l border-gray-500" style={{ left: `${i * 5}%` }} />
        ))}
      </div>

      {/* Simulated roads */}
      <div className="absolute inset-0 opacity-25 pointer-events-none">
        <div className="absolute bg-gray-400 h-2" style={{ top: '30%', left: 0, right: 0 }} />
        <div className="absolute bg-gray-400 h-2" style={{ top: '60%', left: 0, right: 0 }} />
        <div className="absolute bg-gray-400 w-2" style={{ left: '40%', top: 0, bottom: 0 }} />
        <div className="absolute bg-gray-400 w-2" style={{ left: '70%', top: 0, bottom: 0 }} />
      </div>

      {/* "No API key" label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm text-center">
          <p className="text-xs font-medium text-gray-600">Map Preview</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (or NEXT_PUBLIC_GOOGLE_MAPS_KEY) for live map
          </p>
        </div>
      </div>

      {/* User location dot */}
      {userLocation && (
        <div className="absolute z-10" style={{ left: '50%', top: '50%', transform: 'translate(-50%,-50%)' }}>
          <div className="relative w-4 h-4">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
            <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-60" />
          </div>
        </div>
      )}

      {/* Station markers */}
      {stations.map((station, index) => {
        const pos = markerPositions[index % markerPositions.length];
        return (
          <button
            key={station.id}
            className="absolute z-10 -translate-x-1/2 -translate-y-1/2 group"
            style={pos}
            onClick={() => onStationClick(station)}
            aria-label={`Select ${station.name}`}
          >
            <div className="relative">
              <div className="w-9 h-9 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-base">⛽</span>
              </div>
              {/* Tooltip */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
                {station.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
