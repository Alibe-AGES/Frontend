import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

import { useDefaultBackController } from '@/components/BackButton/controllers/useDefaultBackController';
import type { DropdownOption } from '@/components/Dropdown';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { getGroupCalendar } from '@/server/calendar';
import { getEventDetails } from '@/server/events';
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
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { handleBack } = useDefaultBackController({
    fallbackHref: groupId ? `/group/${groupId}/memories` : '/groups',
  });

  const [events, setEvents] = useState<DropdownOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
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

  const goBack = () => {
    void handleBack();
  };

  // There is no endpoint to persist a memory yet, so creating just closes the flow.
  const handleCreate = goBack;

  return (
    <NewMemoryScreen
      error={error}
      events={events}
      groupId={groupId}
      hasPhoto={photo !== null}
      isLoadingEvents={isLoadingEvents}
      isSubmitting={false}
      onClose={goBack}
      onCreate={handleCreate}
      onPhotoSelected={setPhoto}
      onSelectEvent={setSelectedEventId}
      selectedEventId={selectedEventId}
    />
  );
}
