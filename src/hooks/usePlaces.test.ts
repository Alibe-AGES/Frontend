import { renderHook, waitFor } from '@testing-library/react-native';

import { EMPTY_FILTER_VALUE } from '@/components/FilterSheet';
import { searchPlaces } from '@/server/places';
import * as Location from 'expo-location';
import { usePlaces } from './usePlaces';

jest.mock('@/server/places', () => ({ searchPlaces: jest.fn() }));
jest.mock('expo-location', () => ({
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
}));

const coordinates = {
  latitude: -30.0277,
  longitude: -51.2287,
  altitude: 0,
  accuracy: 10,
  altitudeAccuracy: 10,
  heading: 0,
  speed: 0,
};

describe('usePlaces', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: true });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: coordinates });
    (searchPlaces as jest.Mock).mockResolvedValue([
      { id: 'place-1', name: 'Bloom Café', address: 'Rua A' },
    ]);
  });

  test('requests nearby backend places using the current device location', async () => {
    const input = { query: '', tagIds: [], filters: EMPTY_FILTER_VALUE };
    const { result } = await renderHook(() => usePlaces(input));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(searchPlaces).toHaveBeenCalledWith({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      ...input,
    });
    expect(result.current.places[0]).toMatchObject({ id: 'place-1', name: 'Bloom Café' });
  });

  test('shows a useful error when location access is denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ granted: false });
    const { result } = await renderHook(() =>
      usePlaces({ query: '', tagIds: [], filters: EMPTY_FILTER_VALUE })
    );

    await waitFor(() => {
      expect(result.current.error).toMatch(/localização/i);
    });
    expect(searchPlaces).not.toHaveBeenCalled();
  });
});
