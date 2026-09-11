import { useCallback, useState } from 'react';
import { GroupColor, getRandomGroupColor } from '@/utils/groupColors';

export interface Group {
  id: string;
  name: string;
  photoUri?: string | null;
  color: GroupColor;
}

interface GroupFixture {
  id: string;
  name: string;
  photoUri?: string | null;
}

// Fixture data until src/server exposes a real groups endpoint.
const GROUP_FIXTURES: GroupFixture[] = [
  { id: '1', name: 'Hermanas' },
  { id: '2', name: 'Pela cidade' },
  { id: '3', name: 'Galera 2012' },
];

function withRandomColors(fixtures: GroupFixture[]): Group[] {
  return fixtures.map((fixture) => ({ ...fixture, color: getRandomGroupColor() }));
}

interface UseGroupsResult {
  groups: Group[];
  isRefreshing: boolean;
  refetch: () => void;
}

export function useGroups(): UseGroupsResult {
  const [groups, setGroups] = useState<Group[]>(() => withRandomColors(GROUP_FIXTURES));
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refetch = useCallback(() => {
    setIsRefreshing(true);
    setGroups(withRandomColors(GROUP_FIXTURES));
    setIsRefreshing(false);
  }, []);

  return { groups, isRefreshing, refetch };
}
