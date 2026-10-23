import { createEvent, getProposalDetails } from '@/server/events';
import type { ProposalDetailsResponse } from '@/server/events';
import { getGroupMembers, getMe, type GroupMember } from '@/server/groups';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { MatchScreen } from './index';

export default function MatchController() {
  const router = useRouter();
  const { id: groupId, proposalId } = useLocalSearchParams<{
    id: string;
    proposalId: string;
  }>();
  const [proposal, setProposal] = useState<ProposalDetailsResponse | null>(null);
  const [participants, setParticipants] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;
    Promise.all([
      getProposalDetails(proposalId),
      getGroupMembers(groupId),
      getMe().catch(() => null),
    ])
      .then(([proposalDetails, members, user]) => {
        if (!isActive) return;
        setProposal(proposalDetails);
        setParticipants(members);
        setCurrentUserId(user?.id);
      })
      .catch((error: unknown) => {
        console.error('Erro ao carregar o match', error);
        Toast.show({
          type: 'error',
          text1: 'Erro',
          text2: 'Não foi possível carregar o match.',
        });
      });
    return () => {
      isActive = false;
    };
  }, [groupId, proposalId]);

  const handleSchedule = async (date: string, time: string): Promise<void> => {
    setIsSubmitting(true);
    try {
      const location = proposal?.location;
      if (!location) throw new Error('A sugestão não possui um local salvo');
      const event = await createEvent(groupId, {
        name: proposal.name ?? location.name ?? location.address ?? 'Encontro do grupo',
        date,
        time,
        locationId: location.id,
        matchedSuggestionId: proposalId,
      });
      router.replace({
        pathname: '/group/[id]/event-created',
        params: { id: groupId, eventId: event.id },
      });
    } catch (error) {
      console.error('Erro ao agendar o match', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível criar o evento. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!proposal) return null;

  return (
    <MatchScreen
      proposal={proposal}
      participants={participants}
      currentUserId={currentUserId}
      isSubmitting={isSubmitting}
      onSchedule={handleSchedule}
    />
  );
}
