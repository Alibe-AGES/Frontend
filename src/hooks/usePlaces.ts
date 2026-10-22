import { Place } from '@/components/PlaceList/PlaceList.types';
import { MOCK_PLACES } from '@/server/mock/places';
import { useCallback, useEffect, useState } from 'react';

interface UsePlacesResult {
  places: Place[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Mocked until the backend locations endpoint is merged; swap this for the HTTP call then.
function loadPlaces(): Promise<Place[]> {
  return Promise.resolve(MOCK_PLACES);
}

export function usePlaces(): UsePlacesResult {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setPlaces(await loadPlaces());
    } catch {
      setError('Não foi possível carregar os locais.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchPlaces();
  }, [fetchPlaces]);

  return { places, isLoading, error, refetch: fetchPlaces };
}
