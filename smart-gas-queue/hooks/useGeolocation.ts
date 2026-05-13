'use client';

import { useState, useEffect } from 'react';
import { LatLng } from '@/types';

interface GeolocationState {
  location: LatLng | null;
  error: string | null;
  loading: boolean;
}

// Default to Addis Ababa center
const DEFAULT_LOCATION: LatLng = { lat: 9.005401, lng: 38.763611 };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState({ location: DEFAULT_LOCATION, error: 'Geolocation not supported', loading: false });
      return;
    }

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
        // Fall back to Addis Ababa center
        setState({
          location: DEFAULT_LOCATION,
          error: 'Location permission denied. Showing Addis Ababa.',
          loading: false,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  const recenter = () => {
    setState((prev) => ({ ...prev, loading: true }));
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
      }
    );
  };

  return { ...state, recenter };
}
