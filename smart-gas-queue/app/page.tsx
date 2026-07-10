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
  Radar,
  Sparkles,
} from 'lucide-react';
import { Station } from '@/types';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useAuth } from '@/contexts/AuthContext';
import { stationService } from '@/services/stationService';
import { FloatingSearchBar } from '@/components/map/FloatingSearchBar';
import { NearbyStationsStrip } from '@/components/map/NearbyStationsStrip';
import { StationPopup } from '@/components/stations/StationPopup';

const MapContainer = dynamic(
  () => import('@/components/map/MapContainer').then((m) => m.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-red-950/30 to-slate-100">
        <div className="absolute inset-0 animate-pulse-slow bg-[radial-gradient(ellipse_at_30%_20%,rgba(220,38,38,0.15),transparent_50%)]" />
        <motion.div
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <div className="relative mx-auto mb-4 h-14 w-14">
            <div className="absolute inset-0 animate-ping rounded-full bg-primary-500/30" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-float ring-1 ring-primary-500/15">
              <Fuel className="h-7 w-7 text-primary-600" strokeWidth={2} />
            </div>
          </div>
          <p className="text-sm font-semibold tracking-tight text-white">Loading map…</p>
          <p className="mt-1 text-xs text-white/70">Finding stations near you</p>
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
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState(false);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 9.005401, lng: 38.763611 });

  const loadStations = useCallback((lat: number, lng: number) => {
    setStationsLoading(true);
    setStationsError(false);
    stationService
      .getNearbyStations(lat, lng)
      .then(setStations)
      .catch(() => {
        setStations([]);
        setStationsError(true);
      })
      .finally(() => setStationsLoading(false));
  }, []);

  useEffect(() => {
    if (!locationReady) return;
    setMapCenter(userLocation);
    loadStations(userLocation.lat, userLocation.lng);
  }, [userLocation, locationReady, loadStations]);

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
        className="absolute right-4 top-4 z-20"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {user ? (
          <Link
            href="/dashboard"
            className="glass group flex h-11 items-center gap-2 rounded-full pl-1 pr-3 shadow-float ring-1 ring-gray-950/[0.06] transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-premium motion-reduce:hover:translate-y-0"
            aria-label="Go to dashboard"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient shadow-brand-glow transition-transform duration-200 ease-premium group-hover:scale-105">
              <span className="font-mono text-xs font-bold text-white">
                {user.fullName.charAt(0).toUpperCase()}
              </span>
            </div>
            <LayoutDashboard
              className="h-4 w-4 text-gray-500 transition-colors group-hover:text-primary-600"
              aria-hidden
            />
          </Link>
        ) : (
          <Link
            href="/login"
            className="glass flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold text-gray-900 shadow-float ring-1 ring-gray-950/[0.06] transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:shadow-premium motion-reduce:hover:translate-y-0"
            aria-label="Sign in"
          >
            <LogIn className="h-4 w-4 text-primary-600" aria-hidden />
            Sign In
          </Link>
        )}
      </motion.div>

      <motion.button
        type="button"
        onClick={handleRecenter}
        disabled={recentering || !locationReady}
        className="glass absolute bottom-8 right-4 z-20 flex h-14 w-14 items-center justify-center rounded-2xl shadow-float ring-1 ring-gray-950/[0.06] transition-all duration-200 ease-premium hover:bg-primary-50/70 hover:shadow-premium active:scale-95 disabled:opacity-60"
        aria-label="Recenter map to my location"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.94 }}
        transition={fabTransition}
      >
        {recentering ? (
          <Loader2 className="h-6 w-6 animate-spin text-red-600" aria-hidden />
        ) : (
          <LocateFixed className="h-6 w-6 text-red-600" aria-hidden />
        )}
      </motion.button>

      {!locationReady && (
        <motion.div
          className="absolute bottom-8 left-4 z-20 max-w-[min(100%,calc(100vw-5.5rem))]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-float ring-1 ring-gray-950/[0.06]">
            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand-glow">
              <Radar
                className="h-5 w-5 motion-safe:animate-spin"
                style={{ animationDuration: '2.5s' }}
                aria-hidden
              />
            </span>
            <div className="min-w-0">
              <p className="flex items-center gap-2 text-sm font-bold tracking-tight text-gray-900">
                Locating you
                <span className="flex gap-0.5" aria-hidden>
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="inline-block h-1 w-1 rounded-full bg-primary-500"
                      animate={{ opacity: [0.25, 1, 0.25] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
                    />
                  ))}
                </span>
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-gray-500">
                Hang tight — nearby stations load next
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {locationReady && (stationsLoading || stations.length > 0) && (
        <motion.div
          className="absolute bottom-8 left-4 z-20 flex max-w-[min(100%,calc(100vw-5.5rem))] flex-col gap-2"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <motion.div
            className="glass flex items-center gap-2 self-start rounded-full py-1.5 pl-1.5 pr-3.5 shadow-float ring-1 ring-gray-950/[0.06]"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 380, damping: 24 }}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-white shadow-brand-glow">
              <Fuel className="h-4 w-4" aria-hidden />
            </span>
            <div className="leading-tight">
              <p className="flex items-center gap-1 text-xs font-bold tracking-tight text-gray-900">
                FuelQ
                <Sparkles className="h-3 w-3 animate-pulse text-amber-500" aria-hidden />
              </p>
              <p className="text-[10px] font-medium text-gray-500">Smart gas queue</p>
            </div>
          </motion.div>

          <NearbyStationsStrip
            stations={stations}
            isLoading={stationsLoading}
            selectedId={selectedStation?.id}
            onSelect={handleStationSelect}
          />
        </motion.div>
      )}

      {locationReady && !stationsLoading && !stationsError && stations.length === 0 && (
        <motion.div
          className="absolute bottom-8 left-4 z-20 max-w-[min(100%,calc(100vw-5.5rem))]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-float ring-1 ring-amber-500/20">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-soft">
              <MapPin className="h-4 w-4 motion-safe:animate-float" aria-hidden />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="flex items-center gap-1 text-xs font-bold tracking-tight text-gray-900">
                FuelQ
                <Sparkles className="h-3 w-3 animate-pulse text-amber-500" aria-hidden />
              </p>
              <p className="text-[11px] leading-relaxed text-gray-600">
                No stations in range — try moving the map or widen search later.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {locationReady && !stationsLoading && stationsError && (
        <motion.div
          className="absolute bottom-8 left-4 z-20 max-w-[min(100%,calc(100vw-5.5rem))]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        >
          <div
            role="alert"
            className="glass flex items-center gap-3 rounded-2xl px-4 py-3 shadow-float ring-1 ring-primary-500/20"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand-glow">
              <MapPin className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="text-xs font-bold tracking-tight text-gray-900">
                Couldn’t load nearby stations
              </p>
              <button
                type="button"
                onClick={() => loadStations(userLocation.lat, userLocation.lng)}
                className="mt-0.5 text-xs font-semibold text-primary-600 underline underline-offset-2 transition-colors hover:text-primary-700"
              >
                Try again
              </button>
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
