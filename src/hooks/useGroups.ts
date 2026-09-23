import { getGroupMembers, getMe, listGroups } from '@/server/groups';
import { GroupColor, getRandomGroupColor } from '@/utils/groupColors';
import { useCallback, useEffect, useState } from 'react';

export interface Group {
  id: string;
  name: string;
  photoUri: string | null;
  color: GroupColor;
  membersPreview?: string;
}

interface UseGroupsResult {
  groups: Group[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

type FetchMode = 'initial' | 'refresh';

function buildMembersPreview(
  names: string[],
  currentUserId: string | undefined,
  memberIds: string[]
): string | undefined {
  if (names.length === 0) {
    return undefined;
  }

  const currentUserIndex = currentUserId ? memberIds.indexOf(currentUserId) : -1;

  if (currentUserIndex >= 0) {
    const others = names.filter((_, index) => index !== currentUserIndex);
    return ['Eu', ...others].join(', ');
  }

  return names.join(', ');
}

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

      let currentUserId: string | undefined;
      try {
        const me = await getMe();
        currentUserId = me.id;
      } catch {
        currentUserId = undefined;
      }

      const enriched = await Promise.all(
        serverGroups.map(async (group) => {
          let membersPreview: string | undefined;

          try {
            const members = await getGroupMembers(group.id);
            membersPreview = buildMembersPreview(
              members.map((m) => m.name),
              currentUserId,
              members.map((m) => m.id)
            );
          } catch {
            membersPreview = undefined;
          }

          return {
            id: group.id,
            name: group.name,
            photoUri: group.profilePic,
            color: getRandomGroupColor(),
            membersPreview,
          };
        })
      );

      setGroups(enriched);
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
