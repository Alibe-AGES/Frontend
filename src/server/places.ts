import type { FilterSheetValue } from '@/components/FilterSheet/FilterSheet.types';
import type { Place } from '@/components/PlaceList/PlaceList.types';
import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import { authenticatedFetch, getAuthenticationHeaders } from './authenticated-fetch';

export interface PlacesSearchInput {
  latitude: number;
  longitude: number;
  query: string;
  tagIds: string[];
  filters: FilterSheetValue;
}

export const PLACES_PAGE_SIZE = 20;

export interface PlacesPage {
  places: Place[];
  hasMore: boolean;
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
  items?: unknown;
  data?: unknown;
  meta?: RawPageMeta;
  pagination?: RawPageMeta;
}

interface RawPageMeta {
  totalPages?: unknown;
  lastPage?: unknown;
  hasNextPage?: unknown;
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

function buildSearchParams(input: PlacesSearchInput, page: number, type?: string): URLSearchParams {
  const params = new URLSearchParams({
    latitude: String(input.latitude),
    longitude: String(input.longitude),
    page: String(page),
    limit: String(PLACES_PAGE_SIZE),
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

function getHasMore(meta: RawPageMeta | undefined, page: number, filledPage: boolean): boolean {
  if (typeof meta?.hasNextPage === 'boolean') return meta.hasNextPage;

  const totalPages = meta?.totalPages ?? meta?.lastPage;
  if (typeof totalPages === 'number') return page < totalPages;

  return filledPage;
}

function parsePlacesPage(
  body: unknown,
  page: number
): { items: LocationListItem[]; hasMore: boolean } {
  const envelope = (body ?? {}) as LocationListResponse;
  const rawItems = Array.isArray(body) ? body : (envelope.items ?? envelope.data);
  const items = Array.isArray(rawItems) ? (rawItems as LocationListItem[]) : [];

  return {
    items,
    hasMore: getHasMore(
      envelope.pagination ?? envelope.meta,
      page,
      items.length >= PLACES_PAGE_SIZE
    ),
  };
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

export async function searchPlaces(input: PlacesSearchInput, page = 1): Promise<PlacesPage> {
  const selectedTypes = input.tagIds
    .filter((tagId) => tagId !== 'recommended')
    .flatMap((tagId) => CATEGORY_TYPES[tagId] ?? []);
  const types = [...new Set(selectedTypes)];
  const requestTypes: (string | undefined)[] = types.length > 0 ? types : [undefined];
  const path = input.query.trim() ? '/api/locations/search' : '/api/locations';
  const results = await Promise.all(
    requestTypes.map(async (type) => {
      const params = buildSearchParams(input, page, type);
      const response = await authenticatedFetch(`${API_BASE_URL}${path}?${params.toString()}`);
      if (!response.ok) {
        const message = await response.text();
        throw new ApiError(
          message || response.statusText || 'Não foi possível carregar os locais',
          response.status
        );
      }
      return parsePlacesPage(await response.json(), page);
    })
  );
  const photoHeaders = await getAuthenticationHeaders();
  const uniqueItems = new Map<string, LocationListItem>();
  results
    .flatMap((result) => result.items)
    .forEach((item) => {
      if (!uniqueItems.has(item.externalId)) uniqueItems.set(item.externalId, item);
    });
  return {
    places: [...uniqueItems.values()].map((item) => toPlace(item, photoHeaders)),
    hasMore: results.some((result) => result.hasMore),
  };
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
