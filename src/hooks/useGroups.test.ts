import { act, renderHook, waitFor } from '@testing-library/react-native';
import { Group as ServerGroup, listGroups } from '@/server/groups';
import { useGroups } from './useGroups';

jest.mock('@/server/groups', () => ({
  listGroups: jest.fn(),
}));

const mockListGroups = listGroups as jest.MockedFunction<typeof listGroups>;

const SERVER_GROUPS: ServerGroup[] = [
  { id: '1', name: 'Hermanas', profilePic: null, createdAt: '2026-01-01T00:00:00.000Z' },
  {
    id: '2',
    name: 'Pela cidade',
    profilePic: 'https://cdn.alibe.com/pela-cidade.jpg',
    createdAt: '2026-01-02T00:00:00.000Z',
  },
];

describe('useGroups', () => {
  beforeEach(() => {
    mockListGroups.mockResolvedValue(SERVER_GROUPS);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('finishes loading once the backend responds', async () => {
    const { result } = await renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  test('loads every group returned by the backend, mapping profilePic to photoUri', async () => {
    const { result } = await renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(2);
    });

    expect(result.current.groups[0]).toMatchObject({ id: '1', name: 'Hermanas', photoUri: null });
    expect(result.current.groups[1]).toMatchObject({
      id: '2',
      name: 'Pela cidade',
      photoUri: 'https://cdn.alibe.com/pela-cidade.jpg',
    });
    result.current.groups.forEach((group) => {
      expect(typeof group.color).toBe('string');
    });
  });

  test('refetch reloads the groups from the backend', async () => {
    const { result } = await renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.groups).toHaveLength(2);
    });

    mockListGroups.mockClear();

    await act(async () => {
      await result.current.refetch();
    });

    expect(mockListGroups).toHaveBeenCalledTimes(1);
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.groups).toHaveLength(2);
  });

  test('exposes an error message and an empty list when the request fails', async () => {
    mockListGroups.mockRejectedValue(new Error('network error'));

    const { result } = await renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Não foi possível carregar os grupos.');
    expect(result.current.groups).toEqual([]);
  });

  test('clears a previous error once a refetch succeeds', async () => {
    mockListGroups.mockRejectedValueOnce(new Error('network error'));

    const { result } = await renderHook(() => useGroups());

    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });

    mockListGroups.mockResolvedValueOnce(SERVER_GROUPS);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.groups).toHaveLength(2);
  });
});
