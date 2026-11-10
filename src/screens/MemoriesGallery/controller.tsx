import { MemoriesGalleryScreen, type MemoryEventSection } from '@/screens/MemoriesGallery';
import { CalendarDay, getGroupCalendar } from '@/server/calendar';
import { getEventDetails, getEventMemories, getMemoryImageUrl } from '@/server/events';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

const LOAD_ERROR = 'Não foi possível carregar as memórias do grupo.';

function getDayEventIds(day: CalendarDay): string[] {
  return [
    ...new Set([
      ...day.completedEventIds,
      ...day.scheduledEventIds,
      ...(day.proposalEventIds ?? []).map(({ eventId }) => eventId),
    ]),
  ];
}

function resolveCalendarPeriod(date?: string, monthParam?: string, yearParam?: string) {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month] = date.split('-').map(Number);
    if (year && month >= 1 && month <= 12) {
      return { month, year, selectedDate: date };
    }
  }

  const now = new Date();
  const parsedMonth = Number(monthParam);
  const parsedYear = Number(yearParam);
  const month = parsedMonth >= 1 && parsedMonth <= 12 ? parsedMonth : now.getMonth() + 1;
  const year = parsedYear >= 1000 && parsedYear <= 9999 ? parsedYear : now.getFullYear();

  return { month, year, selectedDate: undefined };
}

export function sortMemorySections(
  sections: MemoryEventSection[],
  selectedDate?: string
): MemoryEventSection[] {
  return [...sections].sort((first, second) => {
    if (selectedDate) {
      const firstMatchesSelected = first.date === selectedDate;
      const secondMatchesSelected = second.date === selectedDate;

      if (firstMatchesSelected !== secondMatchesSelected) {
        return firstMatchesSelected ? -1 : 1;
      }
    }

    const dateComparison = second.date.localeCompare(first.date);
    if (dateComparison !== 0) {
      return dateComparison;
    }

    return (second.time ?? '').localeCompare(first.time ?? '');
  });
}

export default function MemoriesGalleryController() {
  const router = useRouter();
  const {
    id: groupId,
    date,
    month: monthParam,
    year: yearParam,
  } = useLocalSearchParams<{
    id: string;
    date?: string;
    month?: string;
    year?: string;
  }>();

  const requestIdRef = useRef(0);
  const [sections, setSections] = useState<MemoryEventSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadMemories = useCallback(async () => {
    if (!groupId) {
      setSections([]);
      setIsLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setErrorMessage(null);

    const { month, year, selectedDate } = resolveCalendarPeriod(date, monthParam, yearParam);

    try {
      const calendarDays = await getGroupCalendar(groupId, month, year);
      if (requestIdRef.current !== requestId) {
        return;
      }

      const eventDayEntries: { calendarDate: string; eventId: string }[] = [];
      const seenEventIds = new Set<string>();

      for (const day of calendarDays) {
        for (const eventId of getDayEventIds(day)) {
          if (!seenEventIds.has(eventId)) {
            seenEventIds.add(eventId);
            eventDayEntries.push({ calendarDate: day.date, eventId });
          }
        }
      }

      const results = await Promise.allSettled(
        eventDayEntries.map(
          async ({ calendarDate, eventId }): Promise<MemoryEventSection | null> => {
            const [eventDetails, memories] = await Promise.all([
              getEventDetails(eventId),
              getEventMemories(eventId),
            ]);

            if (memories.length === 0) {
              return null;
            }

            const eventDate = eventDetails.date?.slice(0, 10) ?? calendarDate;
            const trimmedName = eventDetails.name?.trim();
            const trimmedLocation = eventDetails.location?.description?.trim();
            const eventName =
              (trimmedName && trimmedName.length > 0 ? trimmedName : undefined) ??
              (trimmedLocation && trimmedLocation.length > 0 ? trimmedLocation : undefined) ??
              'Encontro';

            return {
              eventId: eventDetails.id,
              date: eventDate,
              time: eventDetails.time,
              eventName,
              photos: memories.map((memory) => ({
                id: memory.id,
                imageUrl: getMemoryImageUrl(memory),
              })),
            };
          }
        )
      );

      if (requestIdRef.current !== requestId) {
        return;
      }

      if (results.length > 0 && results.every((result) => result.status === 'rejected')) {
        throw results[0].reason;
      }

      const validSections = results.flatMap((result) =>
        result.status === 'fulfilled' && result.value !== null ? [result.value] : []
      );

      setSections(sortMemorySections(validSections, selectedDate));
    } catch (error: unknown) {
      if (requestIdRef.current !== requestId) {
        return;
      }
      console.error('Erro ao carregar a galeria de memórias', error);
      setErrorMessage(LOAD_ERROR);
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [date, groupId, monthParam, yearParam]);

  useEffect(() => {
    void loadMemories();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadMemories]);

  const handleAddMemory = () => {
    if (!groupId) {
      return;
    }

    router.push({ pathname: '/group/[id]/memories/new', params: { id: groupId } });
  };

  if (!groupId) {
    return null;
  }

  return (
    <MemoriesGalleryScreen
      groupId={groupId}
      sections={sections}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onAddMemory={handleAddMemory}
      onRetry={() => {
        void loadMemories();
      }}
    />
  );
}
