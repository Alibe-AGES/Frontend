import type { EventCardDraft } from '@/components/EventCard';
import type { Participant } from '@/components/ParticipantAvatars';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { CreateEventScreen, CreateEventTab } from '@/screens/CreateEvent';
import { createEvent, createProposal } from '@/server/events';
import { getGroup, getMe } from '@/server/groups';
import { isValidApiDate } from '@/utils/date';
import { isValidTime } from '@/utils/time';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

const EMPTY_DRAFT: EventCardDraft = { name: '', imageUri: null, address: '', date: '', time: '' };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const DEFAULT_SUGGESTION_LOCATION_ID = '8f41f052-8ea3-426d-92b9-2789cf82eb70';

const SEEDED_LOCATION_BY_ADDRESS: Record<string, string | undefined> = {
  'rua padre chagas, 320 - moinhos de vento, porto alegre - rs':
    'cc33027e-cfb6-4611-b104-158ba673d98d',
  'avenida diário de notícias, 300 - cristal, porto alegre - rs':
    '12839493-d165-4e3d-b666-c891ec5f15ff',
  'avenida borges de medeiros, 2035 - praia de belas, porto alegre - rs':
    'ddc997a7-876c-4b52-bdf8-02880d46111f',
  'rua fictícia, 100 - porto alegre - rs': 'ca36e694-510f-446a-887d-fdbe586f79e9',
  'rua dinarte ribeiro, 150 - moinhos de vento, porto alegre - rs':
    'b7093d0c-fb50-40d0-925a-fd8533bafdfc',
  'avenida ipiranga, 5200 - jardim botânico, porto alegre - rs':
    '27ebd8d1-d4b6-4eee-b679-1101e2d59b19',
  'endereço definido posteriormente': DEFAULT_SUGGESTION_LOCATION_ID,
};

function resolveSuggestionLocationId(address: string, locationIdParam?: string): string {
  if (locationIdParam && UUID_REGEX.test(locationIdParam.trim())) {
    return locationIdParam.trim();
  }

  const trimmedAddress = address.trim();
  if (UUID_REGEX.test(trimmedAddress)) {
    return trimmedAddress;
  }

  const matchedLocationId = SEEDED_LOCATION_BY_ADDRESS[trimmedAddress.toLowerCase()];
  return matchedLocationId ?? DEFAULT_SUGGESTION_LOCATION_ID;
}

export default function CreateEventController() {
  const router = useRouter();
  const {
    id: groupId,
    date: initialDate,
    locationId: initialLocationId,
    address: initialAddress,
    tab: initialTab,
  } = useLocalSearchParams<{
    id: string;
    date?: string;
    locationId?: string;
    address?: string;
    tab?: CreateEventTab;
  }>();

  const validInitialDate = initialDate && isValidApiDate(initialDate) ? initialDate : '';
  const initialActiveTab: CreateEventTab =
    initialTab === 'suggestion' || Boolean(initialLocationId) ? 'suggestion' : 'event';

  const [activeTab, setActiveTab] = useState<CreateEventTab>(initialActiveTab);
  const [draft, setDraft] = useState<EventCardDraft>({
    ...EMPTY_DRAFT,
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

  const isDraftComplete =
    draft.name.trim().length > 0 &&
    draft.address.trim().length > 0 &&
    isValidApiDate(draft.date) &&
    isValidTime(draft.time);

  const handleConfirm = async () => {
    if (!groupId || !isDraftComplete || isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === 'suggestion') {
        const proposal = await createProposal(groupId, {
          locationId: resolveSuggestionLocationId(draft.address, initialLocationId),
          name: draft.name,
          date: draft.date,
          time: draft.time,
        });

        router.replace({
          pathname: '/group/[id]/event-created',
          params: { id: groupId, eventId: proposal.event.id },
        });
        return;
      }

      const event = await createEvent(groupId, {
        name: draft.name,
        date: draft.date,
        time: draft.time,
        location: draft.address,
        image: photo,
      });

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
