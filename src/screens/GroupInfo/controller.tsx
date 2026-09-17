import { GroupInfoScreen, type MemberAvailability } from '@/screens/GroupInfo';
import { getGroupCalendar } from '@/server/calendar';
import { getGroup, getGroupInviteLink, getMe, type GroupDetails } from '@/server/groups';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

function buildMemberAvailabilities(
  days: { date: string; availableUserIds: string[] }[]
): MemberAvailability[] {
  const byMember = new Map<string, string[]>();

  for (const day of days) {
    for (const userId of day.availableUserIds) {
      const existing = byMember.get(userId) ?? [];
      existing.push(day.date);
      byMember.set(userId, existing);
    }
  }

  return [...byMember.entries()].map(([memberId, dates]) => ({
    memberId,
    dates: dates.toSorted((first, second) => first.localeCompare(second)),
  }));
}

export default function GroupInfoController() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [availabilities, setAvailabilities] = useState<MemberAvailability[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [inviteExpiresAt, setInviteExpiresAt] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    if (!groupId) {
      return;
    }

    setIsLoading(true);

    try {
      const now = new Date();
      const [groupData, days] = await Promise.all([
        getGroup(groupId),
        getGroupCalendar(groupId, now.getMonth() + 1, now.getFullYear()),
      ]);

      setGroup(groupData);
      setAvailabilities(buildMemberAvailabilities(days));
    } catch (error) {
      console.error('Erro ao carregar informações do grupo', error);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const loadInvite = useCallback(async () => {
    if (!groupId) {
      return;
    }

    try {
      const invite = await getGroupInviteLink(groupId);
      setInviteExpiresAt(invite.expiresAt);
      setInviteUrl(Linking.createURL('/groups', { queryParams: { invite: invite.token } }));
    } catch (error) {
      console.error('Erro ao carregar link de convite', error);
    }
  }, [groupId]);

  useEffect(() => {
    void load();
    void loadInvite();

    getMe()
      .then((user) => {
        setCurrentUserId(user.id);
      })
      .catch(() => {
        setCurrentUserId(undefined);
      });
  }, [load, loadInvite]);

  const handleLeaveGroup = () => {
    if (!groupId) {
      return;
    }

    router.push({ pathname: '/group/[id]/leave', params: { id: groupId } });
  };

  return (
    <GroupInfoScreen
      group={group}
      availabilities={availabilities}
      currentUserId={currentUserId}
      inviteUrl={inviteUrl}
      inviteExpiresAt={inviteExpiresAt}
      isLoading={isLoading}
      onLeaveGroup={handleLeaveGroup}
      onRefreshInvite={() => void loadInvite()}
    />
  );
}
