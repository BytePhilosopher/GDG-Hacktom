'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Fuel,
  LayoutDashboard,
  Loader2,
  LocateFixed,
  LogIn,
  MapPin,
  Navigation2,
  Radar,
  Sparkles,
} from 'lucide-react';
import { Station } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/contexts/AuthContext';
import { stationService } from '@/services/stationService';
import { FloatingSearchBar } from '@/components/map/FloatingSearchBar';
import { StationPopup } from '@/components/stations/StationPopup';

const MapContainer = dynamic(
  () => import('@/components/map/MapContainer').then((m) => m.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-gradient-to-br from-slate-900 via-red-950/30 to-slate-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(220,38,38,0.15),transparent_50%)] animate-pulse-slow" />
        <motion.div
          className="text-center relative z-10"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
            <div className="relative w-14 h-14 rounded-full bg-white shadow-lg border border-red-100 flex items-center justify-center">
              <Fuel className="w-7 h-7 text-red-600" strokeWidth={2} />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-700">Loading map…</p>
          <p className="text-xs text-slate-500 mt-1">Finding stations near you</p>
        </motion.div>
      </div>
    ),
  }
);

const fabTransition = { type: 'spring' as const, stiffness: 400, damping: 28 };

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { location: userLocation, locationReady, recenter, recentering } = useGeolocation();
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 9.005401, lng: 38.763611 });

  useEffect(() => {
    if (!locationReady) return;
    setMapCenter(userLocation);
    stationService
      .getNearbyStations(userLocation.lat, userLocation.lng)
      .then(setStations)
      .catch(() => setStations([]));
  }, [userLocation, locationReady]);

  const handleRecenter = useCallback(() => {
    recenter();
  }, [recenter]);

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
    <main className="relative h-[100dvh] w-full overflow-hidden" aria-label="Gas station map">
      <div className="absolute inset-0 z-0">
        <MapContainer
          center={mapCenter}
          userLocation={locationReady ? userLocation : null}
          stations={stations}
          onStationClick={setSelectedStation}
        />
      </div>

      <FloatingSearchBar stations={stations} onStationSelect={handleStationSelect} />

      <motion.div
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {user ? (
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-200/80 pl-1 pr-3 h-11 hover:border-red-200 hover:shadow-xl transition-all"
            aria-label="Go to dashboard"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white text-xs font-bold">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <LayoutDashboard className="w-4 h-4 text-slate-600 group-hover:text-red-600 transition-colors" aria-hidden />
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-full shadow-lg border border-gray-200/80 px-4 h-11 hover:border-red-200 hover:shadow-xl transition-all text-sm font-semibold text-slate-700"
            aria-label="Sign in"
          >
            <LogIn className="w-4 h-4 text-red-600" aria-hidden />
            Sign In
          </Link>
        )}
      </motion.div>

      <motion.button
        type="button"
        onClick={handleRecenter}
        disabled={recentering || !locationReady}
        className="absolute bottom-8 right-4 z-20 w-14 h-14 bg-white rounded-2xl shadow-lg border border-gray-200/90 flex items-center justify-center hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all disabled:opacity-60"
        aria-label="Recenter map to my location"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.94 }}
        transition={fabTransition}
      >
        {recentering ? (
          <Loader2 className="w-6 h-6 text-red-600 animate-spin" aria-hidden />
        ) : (
          <LocateFixed className="w-6 h-6 text-red-600" aria-hidden />
        )}
      </motion.button>

      {!locationReady && (
        <motion.div
          className="absolute bottom-8 left-4 z-20 max-w-[min(100%,calc(100vw-5.5rem))]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-gray-200/80 px-4 py-3">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-md">
              <Radar className="h-5 w-5 motion-safe:animate-spin" style={{ animationDuration: '2.5s' }} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                Locating you
                <span className="flex gap-0.5" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="inline-block h-1 w-1 rounded-full bg-red-500"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </span>
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Hang tight — nearby stations load next</p>
            </div>
          </div>
        </motion.div>
      )}

      {locationReady && stations.length > 0 && (
        <motion.div
          className="absolute bottom-8 left-4 z-20 max-w-[min(100%,calc(100vw-5.5rem))] flex flex-col gap-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <motion.div
            className="self-start flex items-center gap-2 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-gray-200/80 px-3 py-2"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 380, damping: 24 }}
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white shadow-md">
              <Fuel className="h-4 w-4" aria-hidden />
            </span>
            <div className="leading-tight pr-1">
              <p className="text-xs font-bold tracking-tight text-slate-900 flex items-center gap-1">
                FuelQ
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" aria-hidden />
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Smart gas queue</p>
            </div>
          </motion.div>

          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/80 px-4 py-2.5 flex items-center gap-3">
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
            </span>
            <Navigation2 className="w-4 h-4 text-red-600 shrink-0 motion-safe:animate-float" aria-hidden />
            <span className="text-sm font-semibold text-slate-800 truncate">
              {stations.length} stations nearby
            </span>
          </div>
        </motion.div>
      )}

      {locationReady && stations.length === 0 && (
        <motion.div
          className="absolute bottom-8 left-4 z-20 max-w-[min(100%,calc(100vw-5.5rem))]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <div className="flex items-center gap-3 rounded-2xl bg-white/95 backdrop-blur-md shadow-lg border border-amber-100 px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <MapPin className="h-4 w-4 motion-safe:animate-float" aria-hidden />
            </span>
            <div className="leading-tight min-w-0">
              <p className="text-xs font-bold text-slate-900 flex items-center gap-1">
                FuelQ
                <Sparkles className="h-3 w-3 text-amber-500 animate-pulse" aria-hidden />
              </p>
              <p className="text-[11px] text-slate-600">No stations in range — try moving the map or widen search later.</p>
            </div>
          </div>
        </motion.div>
      )}

      <StationPopup
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
        onJoinQueue={handleJoinQueue}
      />
    </main>
  );
}
