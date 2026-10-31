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
  externalId: string | null;
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

interface StoredLocationDetailsResponse {
  externalId: string | null;
  name: string | null;
  imageUrl: string | null;
  description: string | null;
  address: string | null;
  rating: number | null;
  priceRange: { start: string | null; end: string | null; currencyCode: string | null };
  phoneNumber: string | null;
  website: string | null;
  openingHours: string[];
}

const CATEGORY_TYPES: Record<string, string[]> = {
  restaurant: ['restaurant'],
  bar: ['bar', 'night_club'],
  class: ['art_gallery', 'museum', 'performing_arts_theater'],
};

function selectedValue(input: PlacesSearchInput, key: string): string | undefined {
  if (!Object.hasOwn(input.filters.selections, key)) return undefined;
  return input.filters.selections[key][0];
}

function buildSearchParams(input: PlacesSearchInput, type?: string): URLSearchParams {
  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    page: '1',
    limit: '20',
  });
  const query = input.query.trim();

  if (query) params.set('q', query);

  if (type) params.set('type', type);

  const distance = selectedValue(input, 'distance');
  if (distance && distance !== 'any') params.set('maxDistanceKm', distance);
  if (input.filters.minBudget) params.set('budgetMin', input.filters.minBudget);
  if (input.filters.maxBudget) params.set('budgetMax', input.filters.maxBudget);

  const period = selectedValue(input, 'period');
  const environment = selectedValue(input, 'environment');
  const groupSize = selectedValue(input, 'idealFor');
  if (period) params.set('period', period);
  if (environment) params.set('environment', environment);
  if (groupSize) params.set('groupSize', groupSize === 'pair' ? 'couple' : groupSize);

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
  const selectedTypes = input.tagIds
    .filter((tagId) => tagId !== 'recommended')
    .flatMap((tagId) => CATEGORY_TYPES[tagId] ?? []);
  const types = [...new Set(selectedTypes)];
  const requestTypes: (string | undefined)[] = types.length > 0 ? types : [undefined];
  const path = input.query.trim() ? '/api/locations/search' : '/api/locations';
  const results = await Promise.all(
    requestTypes.map(async (type) => {
      const params = buildSearchParams(input, type);
      const response = await authenticatedFetch(`${API_BASE_URL}${path}?${params.toString()}`);
      if (!response.ok) {
        const message = await response.text();
        throw new ApiError(
          message || response.statusText || 'Não foi possível carregar os locais',
          response.status
        );
      }
      return (await response.json()) as LocationListResponse;
    })
  );
  const photoHeaders = await getAuthenticationHeaders();
  const uniqueItems = new Map<string, LocationListItem>();
  results
    .flatMap((result) => result.items)
    .forEach((item) => {
      if (!uniqueItems.has(item.externalId)) uniqueItems.set(item.externalId, item);
    });
  return [...uniqueItems.values()].map((item) => toPlace(item, photoHeaders));
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

export async function getStoredLocationDetails(locationId: string): Promise<PlaceDetails> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/api/locations/${encodeURIComponent(locationId)}`
  );

  if (!response.ok) {
    const message = await response.text();
    throw new ApiError(
      message || response.statusText || 'Não foi possível carregar o local',
      response.status
    );
  }

  const details = (await response.json()) as StoredLocationDetailsResponse;
  const parsePrice = (amount: string | null) => {
    if (amount === null) return null;
    const parsed = Number(amount);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    ...details,
    externalId: details.externalId,
    name: details.name ?? details.description ?? details.address ?? 'Local',
    imageUrl: details.imageUrl ? new URL(details.imageUrl, API_BASE_URL).toString() : null,
    priceRange: {
      start: parsePrice(details.priceRange.start),
      end: parsePrice(details.priceRange.end),
      currencyCode: details.priceRange.currencyCode ?? 'BRL',
    },
  };
}
