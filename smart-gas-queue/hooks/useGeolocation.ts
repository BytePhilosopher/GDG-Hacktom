'use client';

import { useState, useEffect, useCallback } from 'react';
import { LatLng } from '@/types';

interface GeolocationState {
  location: LatLng | null;
  error: string | null;
  loading: boolean;
}

// Default to Addis Ababa center — shown immediately while we wait for GPS
const DEFAULT_LOCATION: LatLng = { lat: 9.005401, lng: 38.763611 };

export function useGeolocation() {
  // Start with the default location so the map renders immediately
  const [state, setState] = useState<GeolocationState>({
    location: DEFAULT_LOCATION,
    error: null,
    loading: false, // don't block rendering
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ location: DEFAULT_LOCATION, error: 'Geolocation not supported', loading: false });
      return;
    }

    // Request in the background — short timeout so we don't wait forever
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      () => {
        // Permission denied or unavailable — keep the default, no spinner
        setState({
          location: DEFAULT_LOCATION,
          error: 'Using default location (Addis Ababa).',
          loading: false,
        });
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  const recenter = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          error: null,
          loading: false,
        });
      },
      () => {
        setState((prev) => ({ ...prev, loading: false }));
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
    );
  }, []);

  return { ...state, recenter };
}
