import { PLACES_ENDPOINT } from '@/constants';
import { Place } from '@/components/PlaceList/PlaceList.types';
import { MOCK_PLACES } from '@/server/mock/places';
import { listPlaces, ServerPlace } from '@/server/places';
import { useCallback, useEffect, useState } from 'react';

interface UsePlacesResult {
  places: Place[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function toPlace(place: ServerPlace): Place {
  return {
    id: place.id,
    name: place.name,
    address: place.address,
    photoUri: place.photoUrl ?? undefined,
    category: place.category,
  };
}

// Without a configured endpoint the hook serves mock data.
async function loadPlaces(): Promise<Place[]> {
  const serverPlaces = PLACES_ENDPOINT ? await listPlaces() : MOCK_PLACES;

  return serverPlaces.map(toPlace);
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
