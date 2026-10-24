import { EventCard } from '@/components/EventCard';
import { NavigationBar } from '@/components/NavigationBar';
import { API_BASE_URL } from '@/constants';
import type { ActiveProposal, EventPresenceAnswer } from '@/server/events';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';

interface ProposalDescriptionDetails {
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  priceStart?: number | string;
  priceEnd?: number | string;
  summary?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseProposalDescription(description: string | null): ProposalDescriptionDetails {
  if (!description?.trim()) return {};

  try {
    const parsed: unknown = JSON.parse(description);
    if (!isRecord(parsed)) return { summary: description };

    const details: ProposalDescriptionDetails = {
      ...(typeof parsed.phoneNumber === 'string' ? { phoneNumber: parsed.phoneNumber } : {}),
      ...(typeof parsed.website === 'string' ? { website: parsed.website } : {}),
      ...(Array.isArray(parsed.openingHours) &&
      parsed.openingHours.every((hour): hour is string => typeof hour === 'string')
        ? { openingHours: parsed.openingHours }
        : {}),
      ...(typeof parsed.priceStart === 'number' || typeof parsed.priceStart === 'string'
        ? { priceStart: parsed.priceStart }
        : {}),
      ...(typeof parsed.priceEnd === 'number' || typeof parsed.priceEnd === 'string'
        ? { priceEnd: parsed.priceEnd }
        : {}),
    };

    return Object.keys(details).length > 0 ? details : { summary: description };
  } catch {
    return { summary: description };
  }
}

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
  const hasAlreadyAnswered = proposal.myAnswer === 'yes' || proposal.myAnswer === 'no';
  const isDecisionDisabled = isSubmitting || hasAlreadyAnswered;
  const location = proposal.location;
  const budget = location?.priceRange;
  const descriptionDetails = parseProposalDescription(location?.description ?? null);
  const event = {
    id: proposal.id,
    name: proposal.name ?? location?.name,
    status: 'pending' as const,
    location: {
      address: location?.address,
      description: descriptionDetails.summary,
    },
    imageUrl: resolveImageUrl(location?.imageUrl),
    rating: location?.rating,
    budgetStart: budget?.start ?? descriptionDetails.priceStart,
    budgetEnd: budget?.end ?? descriptionDetails.priceEnd,
    phone: location?.phoneNumber ?? descriptionDetails.phoneNumber,
    openingHours: location?.openingHours.length
      ? location.openingHours
      : descriptionDetails.openingHours,
    website: location?.website ?? descriptionDetails.website,
  };

  return (
    <View className="w-full max-w-md gap-5">
      <EventCard
        variant="proposal"
        event={event}
        testID={`new-experience-proposal-${proposal.id}`}
      />
      <View className="flex-row items-center justify-center gap-10">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Não quero este local"
          accessibilityState={{ disabled: isDecisionDisabled }}
          className={`h-16 w-16 items-center justify-center rounded-full bg-coral ${
            isDecisionDisabled ? 'opacity-50' : 'opacity-100'
          }`}
          disabled={isDecisionDisabled}
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
          accessibilityState={{ disabled: isDecisionDisabled }}
          className={`h-16 w-16 items-center justify-center rounded-full bg-coral ${
            isDecisionDisabled ? 'opacity-50' : 'opacity-100'
          }`}
          disabled={isDecisionDisabled}
          onPress={() => {
            onAnswer('yes');
          }}
          testID="new-experience-like"
        >
          <Ionicons
            name="checkmark"
            size={34}
            color={theme.colors.white}
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
              {proposal.myAnswer === 'yes'
                ? 'Você já sugeriu este local'
                : `${String(proposal.responses.yes)} curtiram este local`}
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
