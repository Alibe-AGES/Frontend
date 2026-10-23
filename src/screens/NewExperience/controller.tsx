import { getActiveProposals, respondToSuggestion } from '@/server/events';
import type { ActiveProposal, EventPresenceAnswer } from '@/server/events';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { NewExperienceScreen } from '.';

export default function NewExperienceController() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const [proposals, setProposals] = useState<ActiveProposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProposals = useCallback(async () => {
    if (!groupId) {
      setProposals([]);
      setError('Grupo inválido.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      setProposals(await getActiveProposals(groupId));
    } catch (loadError: unknown) {
      console.error('Erro ao carregar propostas do grupo', loadError);
      setError('Não foi possível carregar as propostas.');
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void loadProposals();
  }, [loadProposals]);

  const handleAnswer = async (answer: EventPresenceAnswer) => {
    if (proposals.length === 0 || isSubmitting) return;
    const proposal = proposals[0];
    if (proposal.myAnswer !== null) return;

    setIsSubmitting(true);
    try {
      const result = await respondToSuggestion(proposal.id, answer, false);
      if (result.matched && answer === 'yes' && proposal.location) {
        router.replace({
          pathname: '/group/[id]/create-event',
          params: {
            id: groupId,
            matchedSuggestionId: proposal.id,
            locationId: proposal.location.id,
            name: proposal.name ?? proposal.location.name ?? '',
            address: proposal.location.address ?? proposal.location.description ?? '',
          },
        });
        return;
      }

      setProposals((current) => current.slice(1));
    } catch (responseError: unknown) {
      console.error('Erro ao registrar a decisão da proposta', responseError);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível registrar sua escolha. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NewExperienceScreen
      groupId={groupId}
      proposal={proposals[0] ?? null}
      isLoading={isLoading}
      isSubmitting={isSubmitting}
      error={error}
      onRetry={() => {
        void loadProposals();
      }}
      onAnswer={(answer: EventPresenceAnswer) => {
        void handleAnswer(answer);
      }}
    />
  );
}
