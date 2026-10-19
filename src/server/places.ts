import { API_BASE_URL, PLACES_ENDPOINT } from '@/constants';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';

export interface ServerPlace {
  id: string;
  name: string;
  address: string;
  photoUrl: string | null;
  category?: string;
}

function resolvePhotoUrl(photoUrl: string | null): string | null {
  if (!photoUrl) {
    return null;
  }

  return photoUrl.startsWith('http') ? photoUrl : `${API_BASE_URL}${photoUrl}`;
}

export async function listPlaces(): Promise<ServerPlace[]> {
  const response = await authenticatedFetch(`${API_BASE_URL}${PLACES_ENDPOINT}`);

  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText || 'Failed to load places', response.status);
  }

  const places = (await response.json()) as ServerPlace[];

  return places.map((place) => ({ ...place, photoUrl: resolvePhotoUrl(place.photoUrl) }));
}
