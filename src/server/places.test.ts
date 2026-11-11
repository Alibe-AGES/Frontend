import { API_BASE_URL } from '@/constants';
import { authenticatedFetch, getAuthenticationHeaders } from './authenticated-fetch';
import { getPlaceDetails, getStoredLocationDetails, searchPlaces } from './places';

jest.mock('./authenticated-fetch', () => ({
  authenticatedFetch: jest.fn(),
  getAuthenticationHeaders: jest.fn().mockResolvedValue({ Cookie: 'session=valid' }),
}));

describe('searchPlaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticatedFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [
            {
              externalId: 'google-place-1',
              name: 'Museu',
              imageUrl: '/api/locations/photos?name=places%2Fmuseum%2Fphotos%2Fmain',
              address: null,
              distanceMeters: 1500,
              primaryType: 'museum',
              priceRange: { start: 20, end: 40 },
            },
          ],
        }),
    });
  });

  test('uses text search and serializes supported scalar criteria for the backend', async () => {
    const result = await searchPlaces({
      latitude: -30,
      longitude: -51,
      query: '  museu  ',
      tagIds: ['restaurant'],
      filters: {
        minBudget: '20',
        maxBudget: '80',
        selections: {
          distance: ['10'],
          period: ['morning'],
          environment: ['outdoor'],
          idealFor: ['pair'],
        },
      },
    });

    const requestInput = (authenticatedFetch as jest.MockedFunction<typeof authenticatedFetch>).mock
      .calls[0]?.[0];
    if (typeof requestInput !== 'string') throw new Error('Expected request URL string');
    const requestUrl = new URL(requestInput);
    expect(requestUrl.origin).toBe(new URL(API_BASE_URL).origin);
    expect(requestUrl.pathname).toBe('/api/locations/search');
    expect(requestUrl.searchParams.get('q')).toBe('museu');
    expect(requestUrl.searchParams.get('type')).toBe('restaurant');
    expect(requestUrl.searchParams.getAll('type')).toEqual(['restaurant']);
    expect(requestUrl.searchParams.get('period')).toBe('morning');
    expect(requestUrl.searchParams.get('environment')).toBe('outdoor');
    expect(requestUrl.searchParams.get('groupSize')).toBe('couple');
    expect(result[0]).toMatchObject({
      id: 'google-place-1',
      name: 'Museu',
      address: '',
      distanceKm: 1.5,
      averagePrice: 30,
      photoHeaders: { Cookie: 'session=valid' },
      photoUri: new URL(
        '/api/locations/photos?name=places%2Fmuseum%2Fphotos%2Fmain',
        API_BASE_URL
      ).toString(),
    });
    expect(getAuthenticationHeaders).toHaveBeenCalled();
  });

  test('unions multiple selected categories using separate Backend type requests', async () => {
    (authenticatedFetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [{ externalId: 'restaurant-place', name: 'Food' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [{ externalId: 'bar-place', name: 'Drink' }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ items: [{ externalId: 'restaurant-place', name: 'Food' }] }),
      });

    const places = await searchPlaces({
      latitude: -30,
      longitude: -51,
      query: '',
      tagIds: ['restaurant', 'bar'],
      filters: { minBudget: '', maxBudget: '', selections: {} },
    });

    expect(authenticatedFetch).toHaveBeenCalledTimes(3);
    const urls = (
      authenticatedFetch as jest.MockedFunction<typeof authenticatedFetch>
    ).mock.calls.map(([url]) => new URL(url as string));
    expect(urls.map((url) => url.searchParams.get('type'))).toEqual([
      'restaurant',
      'bar',
      'night_club',
    ]);
    expect(places.map((place) => place.id)).toEqual(['restaurant-place', 'bar-place']);
  });

  test('uses the nearby feed when no text search is entered', async () => {
    await searchPlaces({
      latitude: -30,
      longitude: -51,
      query: '',
      tagIds: [],
      filters: { minBudget: '', maxBudget: '', selections: {} },
    });

    const requestInput = (authenticatedFetch as jest.MockedFunction<typeof authenticatedFetch>).mock
      .calls[0]?.[0];
    expect(requestInput).toEqual(expect.stringContaining('/api/locations?'));
  });

  test('maps missing optional fields and skips unavailable filter values', async () => {
    (authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          items: [
            {
              externalId: 'place-without-optionals',
              name: 'Lugar',
              imageUrl: null,
              address: null,
              distanceMeters: null,
              primaryType: null,
              priceRange: null,
            },
            {
              externalId: 'place-with-one-price',
              name: 'Lugar com preço parcial',
              imageUrl: null,
              address: 'Rua B',
              distanceMeters: 0,
              primaryType: 'cafe',
              priceRange: { start: 10, end: null },
            },
          ],
        }),
    });

    const places = await searchPlaces({
      latitude: 0,
      longitude: 0,
      query: '',
      tagIds: ['unknown'],
      filters: {
        minBudget: '',
        maxBudget: '',
        selections: { distance: ['any'] },
      },
    });

    expect(places[0]).toMatchObject({
      id: 'place-without-optionals',
      address: '',
      photoUri: undefined,
      photoHeaders: undefined,
      category: undefined,
      distanceKm: undefined,
      averagePrice: undefined,
    });
    expect(places[1]).toMatchObject({
      distanceKm: 0,
      averagePrice: 10,
      photoUri: undefined,
    });
    expect(authenticatedFetch).toHaveBeenCalledWith(expect.not.stringContaining('maxDistanceKm'));
  });

  test('throws an API error when the places request fails', async () => {
    (authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Unavailable',
      text: () => Promise.resolve(''),
    });

    await expect(
      searchPlaces({
        latitude: 0,
        longitude: 0,
        query: '',
        tagIds: [],
        filters: { minBudget: '', maxBudget: '', selections: {} },
      })
    ).rejects.toMatchObject({ message: 'Unavailable', status: 503 });
  });

  test('uses the generic error message when search fails without server text', async () => {
    (authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: '',
      text: () => Promise.resolve(''),
    });

    await expect(
      searchPlaces({
        latitude: 0,
        longitude: 0,
        query: '',
        tagIds: [],
        filters: { minBudget: '', maxBudget: '', selections: {} },
      })
    ).rejects.toMatchObject({
      message: 'Não foi possível carregar os locais',
      status: 500,
    });
  });
});

describe('getPlaceDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticatedFetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({ externalId: 'google-place-1', imageUrl: '/api/locations/photos' }),
    });
  });

  test('loads the Google Place details and resolves its image URL', async () => {
    const result = await getPlaceDetails('google/place-1');

    expect(authenticatedFetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/api/locations/google-places/google%2Fplace-1`
    );
    expect(result.imageUrl).toBe(new URL('/api/locations/photos', API_BASE_URL).toString());
  });

  test('keeps a missing photo null', async () => {
    (authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ externalId: 'google-place-1', imageUrl: null }),
    });

    await expect(getPlaceDetails('google-place-1')).resolves.toMatchObject({ imageUrl: null });
  });

  test('throws an API error when details cannot be loaded', async () => {
    (authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      text: () => Promise.resolve('Local não encontrado'),
    });

    await expect(getPlaceDetails('missing-place')).rejects.toMatchObject({
      message: 'Local não encontrado',
      status: 404,
    });
  });

  test('uses the generic error message when the server sends no details error text', async () => {
    (authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: '',
      text: () => Promise.resolve(''),
    });

    await expect(getPlaceDetails('broken-place')).rejects.toMatchObject({
      message: 'Não foi possível carregar o local',
      status: 500,
    });
  });
});

describe('getStoredLocationDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads a saved location by its internal id and normalizes the response', async () => {
    (authenticatedFetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 'location-1',
          externalId: null,
          name: 'Piquenique no Parque',
          imageUrl: '/api/locations/location-1/image',
          description: 'Parque aberto',
          address: 'Rua das Flores, 10',
          rating: 4.5,
          priceRange: { start: '10.00', end: '25.50', currencyCode: 'BRL' },
          phoneNumber: null,
          website: null,
          openingHours: [],
        }),
    });

    const result = await getStoredLocationDetails('location-1');

    expect(authenticatedFetch).toHaveBeenCalledWith(`${API_BASE_URL}/api/locations/location-1`);
    expect(result).toMatchObject({
      externalId: null,
      name: 'Piquenique no Parque',
      imageUrl: new URL('/api/locations/location-1/image', API_BASE_URL).toString(),
      priceRange: { start: 10, end: 25.5, currencyCode: 'BRL' },
    });
  });
});
