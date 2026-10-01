import type { EventCardDraft } from '@/components/EventCard';
import type { Participant } from '@/components/ParticipantAvatars';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { CreateEventScreen } from '@/screens/CreateEvent';
import { createEvent } from '@/server/events';
import { getGroup, getMe } from '@/server/groups';
import { isValidApiDate } from '@/utils/date';
import { isValidTime } from '@/utils/time';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

const EMPTY_DRAFT: EventCardDraft = { name: '', imageUri: null, address: '', date: '', time: '' };

export default function CreateEventController() {
  const router = useRouter();
  const { id: groupId, date: initialDate } = useLocalSearchParams<{ id: string; date?: string }>();

  const validInitialDate = initialDate && isValidApiDate(initialDate) ? initialDate : '';
  const [draft, setDraft] = useState<EventCardDraft>({ ...EMPTY_DRAFT, date: validInitialDate });
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
      console.error('Erro ao criar evento', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível criar o evento. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CreateEventScreen
      groupId={groupId}
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
