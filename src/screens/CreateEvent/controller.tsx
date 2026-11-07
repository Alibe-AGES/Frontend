import type { EventCardDraft } from '@/components/EventCard';
import type { Participant } from '@/components/ParticipantAvatars';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { CreateEventScreen, CreateEventTab } from '@/screens/CreateEvent';
import {
  createEvent,
  createProposal,
  type CreateEventInput,
  type CreateProposalInput,
} from '@/server/events';
import { getGroup, getMe } from '@/server/groups';
import { isValidApiDate } from '@/utils/date';
import { isValidTime } from '@/utils/time';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

const EMPTY_DRAFT: EventCardDraft = { name: '', imageUri: null, address: '', date: '', time: '' };

function parsePrice(value?: string): number | undefined {
  if (!value?.trim()) return undefined;
  const price = Number(value.replace(',', '.'));
  return Number.isFinite(price) ? price : undefined;
}

function buildProposalInput(
  draft: EventCardDraft,
  locationId?: string,
  externalId?: string
): CreateProposalInput {
  const details = {
    ...(draft.phoneNumber?.trim() ? { phoneNumber: draft.phoneNumber.trim() } : {}),
    ...(draft.website?.trim() ? { website: draft.website.trim() } : {}),
    ...(draft.openingHours?.trim()
      ? {
          openingHours: draft.openingHours
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean),
        }
      : {}),
    ...(parsePrice(draft.priceStart) !== undefined
      ? { priceStart: parsePrice(draft.priceStart) }
      : {}),
    ...(parsePrice(draft.priceEnd) !== undefined ? { priceEnd: parsePrice(draft.priceEnd) } : {}),
  };
  const description = Object.keys(details).length > 0 ? JSON.stringify(details) : undefined;

  return {
    ...(locationId ? { locationId } : {}),
    ...(externalId ? { externalId } : {}),
    name: draft.name.trim(),
    address: draft.address.trim(),
    ...(description ? { description } : {}),
  };
}

function buildEventInput(
  draft: EventCardDraft,
  locationId: string | undefined,
  matchedSuggestionId: string | undefined,
  image: SelectedPhoto | null
): CreateEventInput {
  let locationInput: Pick<CreateEventInput, 'location' | 'locationId'>;
  if (locationId) {
    locationInput = { locationId };
  } else {
    locationInput = { location: draft.address };
  }
  return {
    name: draft.name,
    date: draft.date,
    time: draft.time,
    ...locationInput,
    ...(matchedSuggestionId ? { matchedSuggestionId } : {}),
    ...(!locationId && image ? { image } : {}),
  };
}

export default function CreateEventController() {
  const router = useRouter();
  const {
    id: groupId,
    date: initialDate,
    locationId: initialLocationId,
    externalId: initialExternalId,
    address: initialAddress,
    name: initialName,
    tab: initialTab,
    matchedSuggestionId: initialMatchedSuggestionId,
  } = useLocalSearchParams<{
    id: string;
    date?: string;
    locationId?: string;
    externalId?: string;
    address?: string;
    name?: string;
    tab?: CreateEventTab;
    matchedSuggestionId?: string;
  }>();

  const validInitialDate = initialDate && isValidApiDate(initialDate) ? initialDate : '';
  const initialActiveTab: CreateEventTab = initialTab === 'suggestion' ? 'suggestion' : 'event';

  const [activeTab, setActiveTab] = useState<CreateEventTab>(initialActiveTab);
  const [draft, setDraft] = useState<EventCardDraft>({
    ...EMPTY_DRAFT,
    name: initialName?.trim() ?? '',
    address: initialAddress?.trim() ?? '',
    date: validInitialDate,
  });
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!groupId) {
      setIsLoadingParticipants(false);
      return;
    }

    getGroup(groupId)
      .then((group) => {
        setParticipants(group.participants);
      })
      .catch((error: unknown) => {
        console.error('Erro ao carregar participantes do grupo', error);
      })
      .finally(() => {
        setIsLoadingParticipants(false);
      });

    getMe()
      .then((user) => {
        setCurrentUserId(user.id);
      })
      .catch(() => {
        setCurrentUserId(undefined);
      });
  }, [groupId]);

  const hasLocation = Boolean(
    initialLocationId ??
    initialExternalId ??
    (draft.address.trim().length > 0 ? 'manual' : undefined)
  );
  const isDraftComplete =
    draft.name.trim().length > 0 &&
    (activeTab === 'suggestion'
      ? draft.address.trim().length > 0
      : hasLocation && isValidApiDate(draft.date) && isValidTime(draft.time));

  const handleConfirm = async () => {
    if (!groupId || !isDraftComplete || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === 'suggestion') {
        const proposal = await createProposal(
          groupId,
          buildProposalInput(draft, initialLocationId, initialExternalId)
        );

        if (proposal.matched) {
          router.replace({
            pathname: '/group/[id]/match',
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

        router.replace({
          pathname: '/group/[id]/experiences/new',
          params: { id: groupId },
        });
        return;
      }

      const event = await createEvent(
        groupId,
        buildEventInput(draft, initialLocationId, initialMatchedSuggestionId, photo)
      );

      router.replace({
        pathname: '/group/[id]/event-created',
        params: { id: groupId, eventId: event.id },
      });
    } catch (error) {
      console.error(
        activeTab === 'suggestion' ? 'Erro ao criar sugestão' : 'Erro ao criar evento',
        error
      );
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2:
          activeTab === 'suggestion'
            ? 'Não foi possível criar a sugestão. Tente novamente.'
            : 'Não foi possível criar o evento. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreateEventScreen
      groupId={groupId}
      openDatePickerOnMount={false}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      draft={draft}
      onChangeDraft={setDraft}
      onSelectDate={(date) => {
        setDraft((currentDraft) => ({ ...currentDraft, date }));
      }}
      onImageSelected={setPhoto}
      participants={participants}
      currentUserId={currentUserId}
      isLoadingParticipants={isLoadingParticipants}
      isConfirmDisabled={!groupId || !isDraftComplete}
      isSubmitting={isSubmitting}
      onConfirm={() => void handleConfirm()}
    />
  );
}
