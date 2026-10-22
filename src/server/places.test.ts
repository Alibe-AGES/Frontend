import { API_BASE_URL } from '@/constants';
import { authenticatedFetch, getAuthenticationHeaders } from './authenticated-fetch';
import { searchPlaces } from './places';

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

  test('uses text search and serializes all active criteria for the backend', async () => {
    const result = await searchPlaces({
      latitude: -30,
      longitude: -51,
      query: '  museu  ',
      tagIds: ['class'],
      filters: {
        minBudget: '20',
        maxBudget: '80',
        selections: {
          distance: ['10'],
          period: ['morning', 'night'],
          environment: ['indoor', 'outdoor'],
          idealFor: ['pair', 'large'],
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
    expect(requestUrl.searchParams.getAll('type')).toEqual([
      'art_gallery',
      'museum',
      'performing_arts_theater',
    ]);
    expect(requestUrl.searchParams.getAll('period')).toEqual(['morning', 'night']);
    expect(requestUrl.searchParams.getAll('environment')).toEqual(['indoor', 'outdoor']);
    expect(requestUrl.searchParams.getAll('groupSize')).toEqual(['couple', 'large']);
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
});
