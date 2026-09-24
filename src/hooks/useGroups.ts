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

async function loadGroups(): Promise<Group[]> {
  const serverGroups = await listGroups();

  let currentUserId: string | undefined;
  try {
    const me = await getMe();
    currentUserId = me.id;
  } catch {
    currentUserId = undefined;
  }

  return Promise.all(
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
}

// Groups fetched by the loading screen, consumed once by the first useGroups mount.
let preloadedGroups: Group[] | null = null;

// Without a deadline an unreachable backend would keep the loading screen up until the OS gives up.
const PRELOAD_TIMEOUT_MS = 5000;

// Best effort: on failure or timeout the cache stays empty and useGroups fetches (and reports errors) itself.
export async function preloadGroups(timeoutMs = PRELOAD_TIMEOUT_MS): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error('Preloading groups timed out'));
    }, timeoutMs);
  });

  try {
    preloadedGroups = await Promise.race([loadGroups(), deadline]);
  } catch {
    preloadedGroups = null;
  } finally {
    clearTimeout(timer);
  }
}

export function useGroups(): UseGroupsResult {
  const [preloaded] = useState(() => preloadedGroups);
  const [groups, setGroups] = useState<Group[]>(preloaded ?? []);
  const [isLoading, setIsLoading] = useState(preloaded === null);
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
      setGroups(await loadGroups());
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
    preloadedGroups = null;

    if (preloaded === null) {
      void fetchGroups('initial');
    }
  }, [fetchGroups, preloaded]);

  const refetch = useCallback(() => fetchGroups('refresh'), [fetchGroups]);

  return { groups, isLoading, isRefreshing, error, refetch };
}
