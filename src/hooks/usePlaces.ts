import { Place } from '@/components/PlaceList/PlaceList.types';
import type { FilterSheetValue } from '@/components/FilterSheet/FilterSheet.types';
import { searchPlaces } from '@/server/places';
import * as Location from 'expo-location';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UsePlacesInput {
  query: string;
  tagIds: string[];
  filters: FilterSheetValue;
}

interface UsePlacesResult {
  places: Place[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function usePlaces({ query, tagIds, filters }: UsePlacesInput): UsePlacesResult {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coordinates, setCoordinates] = useState<Location.LocationObjectCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationAttempt, setLocationAttempt] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    let active = true;

    const loadCoordinates = async () => {
      setLocationError(null);
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          throw new Error('Permita o acesso à localização para encontrar experiências próximas.');
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (active) setCoordinates(position.coords);
      } catch (cause) {
        if (active) {
          setLocationError(
            cause instanceof Error ? cause.message : 'Não foi possível obter sua localização.'
          );
          setIsLoading(false);
        }
      }
    };

    void loadCoordinates();
    return () => {
      active = false;
    };
  }, [locationAttempt]);

  const fetchPlaces = useCallback(async () => {
    if (!coordinates) return;
    const currentRequestId = ++requestId.current;
    setIsLoading(true);
    setError(null);

    try {
      const results = await searchPlaces({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        query,
        tagIds,
        filters,
      });
      if (currentRequestId === requestId.current) setPlaces(results);
    } catch {
      if (currentRequestId === requestId.current) {
        setError('Não foi possível carregar os locais.');
      }
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  }, [coordinates, filters, query, tagIds]);

  useEffect(() => {
    const delay = query.trim() ? 350 : 0;
    const timer = setTimeout(() => {
      void fetchPlaces();
    }, delay);
    return () => {
      clearTimeout(timer);
      requestId.current += 1;
    };
  }, [fetchPlaces]);

  const refetch = useCallback(async () => {
    if (!coordinates) {
      setIsLoading(true);
      setLocationAttempt((attempt) => attempt + 1);
      return;
    }
    await fetchPlaces();
  }, [coordinates, fetchPlaces]);

  return { places, isLoading, error: locationError ?? error, refetch };
}
