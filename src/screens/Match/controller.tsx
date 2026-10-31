import { MatchScreen } from '@/screens/Match';
import { getGroup, getMe, type GroupMember } from '@/server/groups';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function MatchController() {
  const router = useRouter();
  const {
    id: groupId,
    matchedSuggestionId,
    locationId,
    name,
    address,
  } = useLocalSearchParams<{
    id: string;
    matchedSuggestionId?: string;
    locationId?: string;
    name?: string;
    address?: string;
  }>();
  const [participants, setParticipants] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);

  useEffect(() => {
    if (!groupId) {
      setIsLoadingParticipants(false);
      return;
    }

    let isActive = true;
    getGroup(groupId)
      .then((group) => {
        if (isActive) setParticipants(group.participants);
      })
      .catch((error: unknown) => {
        console.error('Erro ao carregar participantes do grupo', error);
      })
      .finally(() => {
        if (isActive) setIsLoadingParticipants(false);
      });

    getMe()
      .then((user) => {
        if (isActive) setCurrentUserId(user.id);
      })
      .catch(() => {
        if (isActive) setCurrentUserId(undefined);
      });

    return () => {
      isActive = false;
    };
  }, [groupId]);

  const isConfirmDisabled = !groupId || !matchedSuggestionId || !locationId;

  const handleConfirm = () => {
    if (isConfirmDisabled) return;

    router.replace({
      pathname: '/group/[id]/create-event',
      params: {
        id: groupId,
        matchedSuggestionId,
        locationId,
        name: name ?? '',
        address: address ?? '',
      },
    });
  };

  return (
    <MatchScreen
      participants={participants}
      currentUserId={currentUserId}
      isLoadingParticipants={isLoadingParticipants}
      isConfirmDisabled={isConfirmDisabled}
      onConfirm={handleConfirm}
    />
  );
}
