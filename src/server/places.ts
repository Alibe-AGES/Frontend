import { API_BASE_URL } from '@/constants';
import type { Place } from '@/components/PlaceList/PlaceList.types';
import type { FilterSheetValue } from '@/components/FilterSheet/FilterSheet.types';
import { ApiError } from './api';
import { authenticatedFetch, getAuthenticationHeaders } from './authenticated-fetch';

export interface PlacesSearchInput {
  latitude: number;
  longitude: number;
  query: string;
  tagIds: string[];
  filters: FilterSheetValue;
}

interface LocationListItem {
  externalId: string;
  name: string;
  imageUrl: string | null;
  address: string | null;
  distanceMeters: number | null;
  primaryType: string | null;
  priceRange: { start: number | null; end: number | null } | null;
}

interface LocationListResponse {
  items: LocationListItem[];
}

export interface PlaceDetails {
  externalId: string;
  name: string;
  imageUrl: string | null;
  description: string | null;
  address: string | null;
  rating: number | null;
  priceRange: { start: number | null; end: number | null; currencyCode: string } | null;
  phoneNumber: string | null;
  website: string | null;
  openingHours: string[];
}

const CATEGORY_TYPES: Record<string, string[]> = {
  restaurant: ['restaurant'],
  bar: ['bar', 'night_club'],
  class: ['art_gallery', 'museum', 'performing_arts_theater'],
};

function buildSearchParams(input: PlacesSearchInput): URLSearchParams {
  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    page: '1',
    limit: '20',
  });
  const query = input.query.trim();

  if (query) params.set('q', query);

  const selectedCategories = input.tagIds.filter((tagId) => tagId !== 'recommended');
  const categoryTypes = [
    ...new Set(selectedCategories.flatMap((tagId) => CATEGORY_TYPES[tagId] ?? [])),
  ];
  if (input.tagIds.length > 0 && !input.tagIds.includes('recommended')) {
    categoryTypes.forEach((type) => {
      params.append('type', type);
    });
  }

  const distanceValues = Object.hasOwn(input.filters.selections, 'distance')
    ? input.filters.selections.distance
    : [];
  const [distance] = distanceValues;
  if (distance && distance !== 'any') params.set('maxDistanceKm', distance);
  if (input.filters.minBudget) params.set('budgetMin', input.filters.minBudget);
  if (input.filters.maxBudget) params.set('budgetMax', input.filters.maxBudget);

  const selected = (key: string): string[] =>
    Object.hasOwn(input.filters.selections, key) ? input.filters.selections[key] : [];
  selected('period').forEach((period) => {
    params.append('period', period);
  });
  selected('environment').forEach((environment) => {
    params.append('environment', environment);
  });
  selected('idealFor').forEach((groupSize) => {
    params.append('groupSize', groupSize === 'pair' ? 'couple' : groupSize);
  });

  return params;
}

function toPlace(item: LocationListItem, photoHeaders: Record<string, string>): Place {
  const start = item.priceRange?.start;
  const end = item.priceRange?.end;
  const prices = [start, end].filter((price): price is number => typeof price === 'number');

  return {
    id: item.externalId,
    name: item.name,
    address: item.address ?? '',
    photoUri: item.imageUrl ? new URL(item.imageUrl, API_BASE_URL).toString() : undefined,
    photoHeaders: item.imageUrl ? photoHeaders : undefined,
    category: item.primaryType ?? undefined,
    distanceKm: item.distanceMeters === null ? undefined : item.distanceMeters / 1000,
    averagePrice:
      prices.length === 0
        ? undefined
        : prices.reduce((sum, price) => sum + price, 0) / prices.length,
  };
}

export async function searchPlaces(input: PlacesSearchInput): Promise<Place[]> {
  const params = buildSearchParams(input);
  const path = input.query.trim() ? '/api/locations/search' : '/api/locations';
  const response = await authenticatedFetch(`${API_BASE_URL}${path}?${params.toString()}`);

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(
      message || response.statusText || 'Não foi possível carregar os locais',
      response.status
    );
  }

  const result = (await response.json()) as LocationListResponse;
  const photoHeaders = await getAuthenticationHeaders();
  return result.items.map((item) => toPlace(item, photoHeaders));
}

export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/locations/google-places/${encodeURIComponent(placeId)}`
  );

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(
      message || response.statusText || 'Não foi possível carregar o local',
      response.status
    );
  }

  const details = (await response.json()) as PlaceDetails;
  return {
    ...details,
    imageUrl: details.imageUrl ? new URL(details.imageUrl, API_BASE_URL).toString() : null,
  };
}
