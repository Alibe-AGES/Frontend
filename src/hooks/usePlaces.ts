import type { FilterSheetValue } from '@/components/FilterSheet/FilterSheet.types';
import { Place } from '@/components/PlaceList/PlaceList.types';
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
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  loadMoreError: string | null;
  loadMore: () => Promise<void>;
  refetch: () => Promise<void>;
}

function appendUniquePlaces(current: Place[], next: Place[]): Place[] {
  const knownIds = new Set(current.map((place) => place.id));
  return [...current, ...next.filter((place) => !knownIds.has(place.id))];
}

export function usePlaces({ query, tagIds, filters }: UsePlacesInput): UsePlacesResult {
  const [places, setPlaces] = useState<Place[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [coordinates, setCoordinates] = useState<Location.LocationObjectCoords | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locationAttempt, setLocationAttempt] = useState(0);
  const requestId = useRef(0);
  const isLoadingMoreRef = useRef(false);

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
    isLoadingMoreRef.current = false;
    setIsLoadingMore(false);
    setLoadMoreError(null);
    setHasMore(false);
    setPage(1);
    setIsLoading(true);
    setError(null);

    try {
      const result = await searchPlaces(
        {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          query,
          tagIds,
          filters,
        },
        1
      );
      if (currentRequestId === requestId.current) {
        setPlaces(result.places);
        setHasMore(result.hasMore);
      }
    } catch {
      if (currentRequestId === requestId.current) {
        setError('Não foi possível carregar os locais.');
      }
    } finally {
      if (currentRequestId === requestId.current) setIsLoading(false);
    }
  }, [coordinates, filters, query, tagIds]);

  const loadMore = useCallback(async () => {
    if (!coordinates || !hasMore || isLoading || isLoadingMoreRef.current) return;

    const nextPage = page + 1;
    const currentRequestId = ++requestId.current;
    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const result = await searchPlaces(
        {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          query,
          tagIds,
          filters,
        },
        nextPage
      );
      if (currentRequestId === requestId.current) {
        setPlaces((current) => appendUniquePlaces(current, result.places));
        setHasMore(result.hasMore);
        setPage(nextPage);
      }
    } catch {
      if (currentRequestId === requestId.current) {
        setLoadMoreError('Não foi possível carregar mais locais.');
      }
    } finally {
      if (currentRequestId === requestId.current) {
        isLoadingMoreRef.current = false;
        setIsLoadingMore(false);
      }
    }
  }, [coordinates, filters, hasMore, isLoading, page, query, tagIds]);

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

  return {
    places,
    hasMore,
    isLoading,
    isLoadingMore,
    error: locationError ?? error,
    loadMoreError,
    loadMore,
    refetch,
  };
}
