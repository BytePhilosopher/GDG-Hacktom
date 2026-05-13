'use client';

import React, { useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, Circle } from '@react-google-maps/api';
import { LatLng, Station } from '@/types';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5f5' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#c9e8f5' }],
  },
];

interface MapContainerProps {
  center: LatLng;
  zoom?: number;
  userLocation: LatLng | null;
  stations: Station[];
  onStationClick: (station: Station) => void;
  onMapLoad?: (map: google.maps.Map) => void;
}

export function MapContainer({
  center,
  zoom = 14,
  userLocation,
  stations,
  onStationClick,
  onMapLoad,
}: MapContainerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

  const handleLoad = useCallback(
    (map: google.maps.Map) => {
      onMapLoad?.(map);
    },
    [onMapLoad]
  );

  if (!apiKey) {
    return <MockMap center={center} stations={stations} onStationClick={onStationClick} userLocation={userLocation} />;
  }

  return (
    <LoadScript
      googleMapsApiKey={apiKey}
      loadingElement={<LoadingSpinner fullScreen text="Loading map..." />}
    >
      <GoogleMap
        mapContainerClassName="w-full h-full"
        center={center}
        zoom={zoom}
        onLoad={handleLoad}
        options={{
          styles: MAP_STYLES,
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: 'greedy',
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_CENTER,
          },
        }}
      >
        {userLocation && (
          <>
            <Marker
              position={userLocation}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#3B82F6',
                fillOpacity: 1,
                strokeColor: '#ffffff',
                strokeWeight: 2,
              }}
            />
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
            icon={{
              path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: '#DC2626',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
            }}
            title={station.name}
          />
        ))}
      </GoogleMap>
    </LoadScript>
  );
}

// Fallback mock map when no API key is provided
function MockMap({
  stations,
  onStationClick,
  userLocation,
}: {
  center?: LatLng;
  stations: Station[];
  onStationClick: (station: Station) => void;
  userLocation: LatLng | null;
}) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-blue-50 relative overflow-hidden">
      {/* Grid lines to simulate map */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute w-full border-t border-gray-400"
            style={{ top: `${i * 5}%` }}
          />
        ))}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute h-full border-l border-gray-400"
            style={{ left: `${i * 5}%` }}
          />
        ))}
      </div>

      {/* Road-like elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute bg-gray-300 h-3" style={{ top: '30%', left: 0, right: 0 }} />
        <div className="absolute bg-gray-300 h-3" style={{ top: '60%', left: 0, right: 0 }} />
        <div className="absolute bg-gray-300 w-3" style={{ left: '40%', top: 0, bottom: 0 }} />
        <div className="absolute bg-gray-300 w-3" style={{ left: '70%', top: 0, bottom: 0 }} />
      </div>

      {/* Map label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
          <p className="text-xs text-gray-500">Map Preview</p>
          <p className="text-xs text-gray-400">Add NEXT_PUBLIC_GOOGLE_MAPS_KEY for live map</p>
        </div>
      </div>

      {/* User location dot */}
      {userLocation && (
        <div
          className="absolute"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg z-10 relative" />
            <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75" />
          </div>
        </div>
      )}

      {/* Station markers */}
      {stations.map((station, index) => {
        const positions = [
          { left: '25%', top: '35%' },
          { left: '60%', top: '25%' },
          { left: '75%', top: '55%' },
          { left: '35%', top: '65%' },
          { left: '55%', top: '70%' },
        ];
        const pos = positions[index % positions.length];

        return (
          <button
            key={station.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={pos}
            onClick={() => onStationClick(station)}
            aria-label={`Select ${station.name}`}
          >
            <div className="relative">
              <div className="w-8 h-8 bg-red-600 rounded-full border-2 border-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                <span className="text-white text-xs font-bold">⛽</span>
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-red-600" />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {station.name}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
