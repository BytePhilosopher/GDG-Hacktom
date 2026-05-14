'use client';

import { useState, useEffect, useCallback } from 'react';
import { LatLng } from '@/types';

interface GeolocationState {
  /** Best-known coordinates (GPS or fallback). */
  location: LatLng;
  /** True after the first browser geolocation attempt finishes (success or fail). */
  locationReady: boolean;
  error: string | null;
  recentering: boolean;
}

// Default to Addis Ababa center — map framing while we wait for GPS
const DEFAULT_LOCATION: LatLng = { lat: 9.005401, lng: 38.763611 };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: DEFAULT_LOCATION,
    locationReady: false,
    error: null,
    recentering: false,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({
        location: DEFAULT_LOCATION,
        locationReady: true,
        error: 'Geolocation not supported',
        recentering: false,
      });
      return;
    }

    // Single initial resolve — avoids fetching “nearby” twice (default then GPS)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          locationReady: true,
          error: null,
          recentering: false,
        });
      },
      () => {
        setState({
          location: DEFAULT_LOCATION,
          locationReady: true,
          error: 'Using default location (Addis Ababa).',
          recentering: false,
        });
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  const recenter = useCallback(() => {
    if (!navigator.geolocation) return;
    setState((prev) => ({ ...prev, recentering: true }));
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          locationReady: true,
          error: null,
          recentering: false,
        });
      },
      () => {
        setState((prev) => ({ ...prev, recentering: false }));
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  return { ...state, recenter };
}
