import { EventCard } from '@/components/EventCard';
import { API_BASE_URL } from '@/constants';
import type { ActiveProposal, EventPresenceAnswer } from '@/server/events';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { NavigationBar } from '@/components/NavigationBar';

export interface NewExperienceScreenProps {
  groupId: string;
  proposal: ActiveProposal | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onRetry: () => void;
  onAnswer: (answer: EventPresenceAnswer) => void;
}

function resolveImageUrl(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${API_BASE_URL}${imageUrl}`;
}

function renderProposalCard(
  proposal: ActiveProposal,
  isSubmitting: boolean,
  onAnswer: NewExperienceScreenProps['onAnswer']
): ReactNode {
  const location = proposal.location;
  const budget = location?.priceRange;
  const event = {
    id: proposal.id,
    name: proposal.name ?? location?.name,
    status: 'pending' as const,
    location: { address: location?.address ?? location?.description },
    imageUrl: resolveImageUrl(location?.imageUrl),
    budgetStart: budget?.start,
    budgetEnd: budget?.end,
    phone: location?.phoneNumber,
    openingHours: location?.openingHours,
    website: location?.website,
  };

  return (
    <View className="w-full max-w-md gap-5">
      <EventCard
        event={event}
        testID={`new-experience-proposal-${proposal.id}`}
      />
      <View className="flex-row items-center justify-center gap-10">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Não quero este local"
          accessibilityState={{ disabled: isSubmitting }}
          className={`h-16 w-16 items-center justify-center rounded-full bg-coral ${
            isSubmitting ? 'opacity-50' : 'opacity-100'
          }`}
          disabled={isSubmitting}
          onPress={() => {
            onAnswer('no');
          }}
          testID="new-experience-dislike"
        >
          <Ionicons
            name="close"
            size={34}
            color={theme.colors.white}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quero este local"
          accessibilityState={{ disabled: isSubmitting }}
          className={`h-16 w-16 items-center justify-center rounded-full bg-lime ${
            isSubmitting ? 'opacity-50' : 'opacity-100'
          }`}
          disabled={isSubmitting}
          onPress={() => {
            onAnswer('yes');
          }}
          testID="new-experience-like"
        >
          <Ionicons
            name="checkmark"
            size={34}
            color={theme.colors.ink}
          />
        </Pressable>
      </View>
    </View>
  );
}

function renderProposalState(props: NewExperienceScreenProps): ReactNode {
  if (props.isLoading) {
    return (
      <View
        className="items-center py-12"
        testID="new-experience-loading"
      >
        <Text className="font-poppins text-base text-ink-soft">Carregando propostas...</Text>
      </View>
    );
  }

  if (props.error) {
    return (
      <View className="items-center gap-4 py-12">
        <Text
          accessibilityRole="alert"
          className="text-center font-poppins text-base text-wine"
        >
          {props.error}
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={props.onRetry}
          className="rounded-full bg-coral px-6 py-3"
          testID="new-experience-retry"
        >
          <Text className="font-poppins-semibold text-white">Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

  if (props.proposal) {
    return renderProposalCard(props.proposal, props.isSubmitting, props.onAnswer);
  }

  return (
    <View
      className="items-center gap-3 py-12"
      testID="new-experience-empty"
    >
      <Ionicons
        name="heart-outline"
        size={44}
        color={theme.colors.coral}
      />
      <Text className="text-center font-poppins-semibold text-lg text-ink">
        Nenhuma proposta por aqui
      </Text>
      <Text className="text-center font-poppins text-sm text-ink-soft">
        Quando alguém sugerir um local, ele aparecerá para vocês decidirem.
      </Text>
    </View>
  );
}

export function NewExperienceScreen({
  groupId,
  proposal,
  isLoading,
  isSubmitting,
  error,
  onRetry,
  onAnswer,
}: NewExperienceScreenProps) {
  return (
    <View className="flex-1 bg-canvas">
      <View className="flex-1 items-center justify-center px-6 pb-28 pt-12">
        <View className="mb-6 items-center gap-2">
          <Text className={`text-center text-3xl text-ink ${theme.typography.display}`}>
            Match de rolês
          </Text>
          {proposal ? (
            <Text className="font-poppins text-sm text-ink-soft">
              {proposal.responses.yes} curtiram este local
            </Text>
          ) : null}
        </View>

        {renderProposalState({
          groupId,
          proposal,
          isLoading,
          isSubmitting,
          error,
          onRetry,
          onAnswer,
        })}
      </View>
      <View className="absolute inset-x-0 bottom-0">
        <NavigationBar groupId={groupId} />
      </View>
    </View>
  );
}
