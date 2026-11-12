import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

import { useDefaultBackController } from '@/components/BackButton/controllers/useDefaultBackController';
import type { DropdownOption } from '@/components/Dropdown';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { getGroupCalendar } from '@/server/calendar';
import { getEventDetails } from '@/server/events';
import { createMemory } from '@/server/memories';
import { resolveCalendarMonth, type CalendarMonth } from '@/utils/calendarMonth';
import { NewMemoryScreen } from '.';

// Memories are made from events that already happened, so the dropdown lists
// the group's completed events for the selected month (the current one by default).
async function loadCompletedEvents(
  groupId: string,
  { month, year }: CalendarMonth,
  selectedDate?: string
): Promise<DropdownOption[]> {
  const days = await getGroupCalendar(groupId, month, year);
  const visibleDays = selectedDate ? days.filter((day) => day.date === selectedDate) : days;
  const eventIds = Array.from(new Set(visibleDays.flatMap((day) => day.completedEventIds)));
  const details = await Promise.all(eventIds.map((eventId) => getEventDetails(eventId)));

  return details.map((event) => ({
    label: event.name ?? 'Evento sem nome',
    value: event.id,
  }));
}

export default function NewMemoryController() {
  const router = useRouter();
  const {
    id: groupId,
    month: monthParam,
    year: yearParam,
    date: selectedDate,
  } = useLocalSearchParams<{ id: string; month?: string; year?: string; date?: string }>();
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
      setEvents(
        await loadCompletedEvents(
          groupId,
          resolveCalendarMonth(monthParam, yearParam),
          selectedDate
        )
      );
    } catch (loadError: unknown) {
      console.error('Erro ao carregar os eventos do grupo', loadError);
      setError('Não foi possível carregar os eventos.');
    } finally {
      setIsLoadingEvents(false);
    }
  }, [groupId, monthParam, yearParam, selectedDate]);

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
      onRetry={() => {
        void loadEvents();
      }}
      onSelectEvent={setSelectedEventId}
      selectedEventId={selectedEventId}
    />
  );
}
