import { act, renderHook } from '@testing-library/react-native';
import { useGroups } from './useGroups';

describe('useGroups', () => {
  test('returns all available groups with an assigned color', async () => {
    const { result } = await renderHook(() => useGroups());

    expect(result.current.groups).toHaveLength(3);
    result.current.groups.forEach((group) => {
      expect(typeof group.color).toBe('string');
    });
  });

  test('refetch reloads every available group', async () => {
    const { result } = await renderHook(() => useGroups());
    const originalIds = result.current.groups.map((group) => group.id).sort();

    await act(() => {
      result.current.refetch();
    });

    expect(result.current.groups.map((group) => group.id).sort()).toEqual(originalIds);
    expect(result.current.isRefreshing).toBe(false);
  });
});
