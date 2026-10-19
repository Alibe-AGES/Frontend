import { renderHook, waitFor } from '@testing-library/react-native';

import { MOCK_PLACES } from '@/server/mock/places';
import { usePlaces } from './usePlaces';

describe('usePlaces', () => {
  test('serves mock places while no endpoint is configured', async () => {
    const { result } = await renderHook(() => usePlaces());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.places).toHaveLength(MOCK_PLACES.length);
    expect(result.current.places[0]).toMatchObject({ id: MOCK_PLACES[0].id, name: 'Bloom Café' });
  });
});
