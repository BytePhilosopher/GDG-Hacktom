'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { Locate, LogIn } from 'lucide-react';
import { Station } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/contexts/AuthContext';
import { stationService } from '@/services/stationService';
import { FloatingSearchBar } from '@/components/map/FloatingSearchBar';
import { StationPopup } from '@/components/stations/StationPopup';
import Link from 'next/link';

// Dynamically import map to avoid SSR issues — no full-screen loading fallback
// so the rest of the UI is always visible
const MapContainer = dynamic(
  () => import('@/components/map/MapContainer').then((m) => m.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-slate-100 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading map…</p>
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { location: userLocation, recenter } = useGeolocation();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 9.005401, lng: 38.763611 });

  // Update map center and load stations whenever location resolves
  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
      stationService
        .getNearbyStations(userLocation.lat, userLocation.lng)
        .then(setStations)
        .catch(() => {}); // silently ignore — mock data always works
    }
  }, [userLocation]);

  const handleRecenter = useCallback(() => {
    recenter();
    if (userLocation) setMapCenter(userLocation);
  }, [recenter, userLocation]);

  const handleJoinQueue = useCallback(
    (station: Station) => {
      if (!user) {
        router.push(`/login?redirect=/station/${station.id}/queue`);
        return;
      }
      router.push(`/station/${station.id}/queue`);
    },
    [user, router]
  );

  const handleStationSelect = useCallback((station: Station) => {
    setSelectedStation(station);
    setMapCenter(station.location);
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden" aria-label="Gas station map">
      {/* Full-screen map — always rendered, never blocked by loading state */}
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          userLocation={userLocation}
          stations={stations}
          onStationClick={setSelectedStation}
        />
      </div>

      {/* Floating search bar */}
      <FloatingSearchBar stations={stations} onStationSelect={handleStationSelect} />

      {/* Top-right profile / sign-in button */}
      <div className="absolute top-4 right-4 z-20">
        {user ? (
          <Link
            href="/dashboard"
            className="w-11 h-11 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-white transition-colors"
            aria-label="Go to dashboard"
          >
            <div className="w-7 h-7 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-200 px-4 h-11 hover:bg-white transition-colors text-sm font-medium text-gray-700"
            aria-label="Sign in"
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        )}
      </div>

      {/* Recenter FAB */}
      <button
        onClick={handleRecenter}
        className="absolute bottom-8 right-4 z-20 w-12 h-12 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
        aria-label="Recenter map to my location"
      >
        <Locate className="w-5 h-5 text-gray-700" />
      </button>

      {/* Station count badge */}
      {stations.length > 0 && (
        <div className="absolute bottom-8 left-4 z-20">
          <div className="bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-200 px-4 h-10 flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-sm font-medium text-gray-700">
              {stations.length} stations nearby
            </span>
          </div>
        </div>
      )}

      {/* Station popup */}
      <StationPopup
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onJoinQueue={handleJoinQueue}
      />
    </main>
  );
}
