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
import { resolveApiImageUrl } from '@/utils/apiImageUrl';
import { isValidApiDate } from '@/utils/date';
import { isValidTime } from '@/utils/time';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

const EMPTY_DRAFT: EventCardDraft = { name: '', imageUri: null, address: '', date: '', time: '' };

interface InitialEventDraftParams {
  date?: string;
  imageUrl?: string;
  address?: string;
  name?: string;
}

function buildInitialDraft(params: InitialEventDraftParams): EventCardDraft {
  const validDate = params.date && isValidApiDate(params.date) ? params.date : '';

  return {
    ...EMPTY_DRAFT,
    name: params.name?.trim() ?? '',
    address: params.address?.trim() ?? '',
    imageUri: resolveApiImageUrl(params.imageUrl),
    date: validDate,
  };
}

// A suggestion from this screen is always a manual place: the user types its name and address.
function buildProposalInput(
  draft: EventCardDraft,
  image: SelectedPhoto | null
): CreateProposalInput {
  return {
    name: draft.name.trim(),
    address: draft.address.trim(),
    ...(image ? { image } : {}),
  };
}

function buildEventInput(
  draft: EventCardDraft,
  locationId: string | undefined,
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
    ...(!locationId && image ? { image } : {}),
  };
}

export default function CreateEventController() {
  const router = useRouter();
  const {
    id: groupId,
    date: initialDate,
    locationId: initialLocationId,
    imageUrl: initialImageUrl,
    address: initialAddress,
    name: initialName,
    tab: initialTab,
  } = useLocalSearchParams<{
    id: string;
    date?: string;
    locationId?: string;
    imageUrl?: string;
    address?: string;
    name?: string;
    tab?: CreateEventTab;
  }>();

  // A matched place (locationId) is already chosen, so only the event tab makes sense.
  const isLocationReadOnly = Boolean(initialLocationId);
  const initialActiveTab: CreateEventTab =
    initialTab === 'suggestion' && !isLocationReadOnly ? 'suggestion' : 'event';

  const [activeTab, setActiveTab] = useState<CreateEventTab>(initialActiveTab);
  const [draft, setDraft] = useState<EventCardDraft>(() =>
    buildInitialDraft({
      date: initialDate,
      imageUrl: initialImageUrl,
      address: initialAddress,
      name: initialName,
    })
  );
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setActiveTab(initialActiveTab);
    setDraft(
      buildInitialDraft({
        date: initialDate,
        imageUrl: initialImageUrl,
        address: initialAddress,
        name: initialName,
      })
    );
    setPhoto(null);
  }, [
    initialActiveTab,
    initialAddress,
    initialDate,
    initialImageUrl,
    initialLocationId,
    initialName,
  ]);

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

  const hasLocation = Boolean(initialLocationId) || draft.address.trim().length > 0;
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
        const proposal = await createProposal(groupId, buildProposalInput(draft, photo));

        if (proposal.matched) {
          router.replace({
            pathname: '/group/[id]/match',
            params: {
              id: groupId,
              matchedSuggestionId: proposal.id,
              locationId: proposal.location.id,
              name: proposal.name ?? proposal.location.name ?? '',
              address: proposal.location.address ?? proposal.location.description ?? '',
              ...(proposal.location.imageUrl ? { imageUrl: proposal.location.imageUrl } : {}),
            },
          });
          return;
        }

        // Stay on the screen; the form is cleared so the same suggestion isn't sent twice.
        Toast.show({
          type: 'success',
          text1: 'Sugestão enviada!',
          text2: `${draft.name.trim()} foi sugerido para o grupo.`,
        });
        setDraft((currentDraft) => ({ ...EMPTY_DRAFT, date: currentDraft.date }));
        setPhoto(null);
        return;
      }

      const event = await createEvent(groupId, buildEventInput(draft, initialLocationId, photo));

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
      isLocationReadOnly={isLocationReadOnly}
      onSelectTab={(tab) => {
        if (tab === 'suggestion' && isLocationReadOnly) return;
        setActiveTab(tab);
      }}
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
