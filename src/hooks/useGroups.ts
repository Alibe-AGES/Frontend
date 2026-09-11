import { listGroups } from '@/server/groups';
import { GroupColor, getRandomGroupColor } from '@/utils/groupColors';
import { useCallback, useEffect, useState } from 'react';

export interface Group {
  id: string;
  name: string;
  photoUri: string | null;
  color: GroupColor;
}

interface UseGroupsResult {
  groups: Group[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

type FetchMode = 'initial' | 'refresh';

export function useGroups(): UseGroupsResult {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async (mode: FetchMode) => {
    if (mode === 'initial') {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const serverGroups = await listGroups();
      setGroups(
        serverGroups.map((group) => ({
          id: group.id,
          name: group.name,
          photoUri: group.profilePic,
          color: getRandomGroupColor(),
        }))
      );
    } catch {
      setError('Não foi possível carregar os grupos.');
    } finally {
      if (mode === 'initial') {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchGroups('initial');
  }, [fetchGroups]);

  const refetch = useCallback(() => fetchGroups('refresh'), [fetchGroups]);

  return { groups, isLoading, isRefreshing, error, refetch };
}
