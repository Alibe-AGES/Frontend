import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

import { useDefaultBackController } from '@/components/BackButton/controllers/useDefaultBackController';
import type { DropdownOption } from '@/components/Dropdown';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { getGroupCalendar } from '@/server/calendar';
import { getEventDetails } from '@/server/events';
import { createMemory } from '@/server/memories';
import { NewMemoryScreen } from '.';

// Memories are made from events that already happened, so the dropdown lists
// the group's completed events for the current month.
async function loadCompletedEvents(groupId: string): Promise<DropdownOption[]> {
  const today = new Date();
  const days = await getGroupCalendar(groupId, today.getMonth() + 1, today.getFullYear());
  const eventIds = Array.from(new Set(days.flatMap((day) => day.completedEventIds)));
  const details = await Promise.all(eventIds.map((eventId) => getEventDetails(eventId)));

  return details.map((event) => ({
    label: event.name ?? 'Evento sem nome',
    value: event.id,
  }));
}

export default function NewMemoryController() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { handleBack } = useDefaultBackController({
    fallbackHref: { pathname: '/group/[id]/memories', params: { id: groupId } },
  });

  const [events, setEvents] = useState<DropdownOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!groupId) {
      setEvents([]);
      setError('Grupo inválido.');
      setIsLoadingEvents(false);
      return;
    }

    setIsLoadingEvents(true);
    setError(null);
    try {
      setEvents(await loadCompletedEvents(groupId));
    } catch (loadError: unknown) {
      console.error('Erro ao carregar os eventos do grupo', loadError);
      setError('Não foi possível carregar os eventos.');
    } finally {
      setIsLoadingEvents(false);
    }
  }, [groupId]);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  const handleCreate = async () => {
    if (!selectedEventId || !photo || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createMemory(selectedEventId, photo);
      router.replace({ pathname: '/group/[id]/memories/created', params: { id: groupId } });
    } catch (createError: unknown) {
      console.error('Erro ao criar a memória', createError);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível criar a memória. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <NewMemoryScreen
      error={error}
      events={events}
      groupId={groupId}
      hasPhoto={photo !== null}
      isLoadingEvents={isLoadingEvents}
      isSubmitting={isSubmitting}
      onClose={() => {
        void handleBack();
      }}
      onCreate={() => {
        void handleCreate();
      }}
      onPhotoSelected={setPhoto}
      onSelectEvent={setSelectedEventId}
      selectedEventId={selectedEventId}
    />
  );
}
