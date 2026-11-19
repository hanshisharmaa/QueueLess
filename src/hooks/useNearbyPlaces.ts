import { useCallback, useEffect, useRef, useState } from 'react';
import type { Category, OsmPlace } from '../lib/types';
import { fetchNearbyPlaces } from '../lib/osm';

interface UseNearbyPlacesOptions {
  category?: Category | 'other' | 'all';
  location?: { latitude: number; longitude: number; radiusKm?: number } | null;
  enabled?: boolean;
}

interface UseNearbyPlacesReturn {
  places: OsmPlace[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useNearbyPlaces(options: UseNearbyPlacesOptions = {}): UseNearbyPlacesReturn {
  const { category = 'all', location, enabled = true } = options;
  const [places, setPlaces] = useState<OsmPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const fetchPlaces = useCallback(async () => {
    stop();
    if (!enabled || !location) {
      setPlaces([]);
      setError(null);
      setLoading(false);
      return;
    }
    const { latitude, longitude, radiusKm } = location;
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNearbyPlaces({
        category,
        latitude,
        longitude,
        radiusKm,
      });
      if (!controller.signal.aborted) {
        setPlaces(data);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Failed to load nearby places';
      setError(message);
      setLoading(false);
      setPlaces([]);
    } finally {
      if (!controller.signal.aborted) {
        abortRef.current = null;
      }
    }
  }, [category, location, enabled, stop]);

  useEffect(() => {
    fetchPlaces();
    return () => stop();
  }, [fetchPlaces, stop]);

  return { places, loading, error, refetch: fetchPlaces };
}
