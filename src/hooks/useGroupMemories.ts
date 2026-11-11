import { useCallback, useEffect, useRef, useState } from 'react';

import { API_BASE_URL } from '@/constants';
import { getGroupCalendar, type CalendarDay } from '@/server/calendar';
import { getEventDetails, getEventMemories, type EventMemoryResponse } from '@/server/events';
import { resolveCalendarMonth } from '@/utils/calendarMonth';
import { getMemoryImageUrl } from '@/utils/memoryImageUrl';

export interface MemoryPhotoItem {
  id: string;
  imageUrl: string;
}

export interface MemoryEventSection {
  eventId: string;
  date: string;
  time?: string | null;
  eventName: string;
  address?: string;
  photos: MemoryPhotoItem[];
}

export interface UseGroupMemoriesParams {
  groupId?: string;
  date?: string;
  month?: string;
  year?: string;
}

const LOAD_ERROR = 'Não foi possível carregar as memórias do grupo.';

export function resolveMemoryImageUrl(picture: string): string {
  if (
    picture.startsWith('http://') ||
    picture.startsWith('https://') ||
    picture.startsWith('file://') ||
    picture.startsWith('data:') ||
    picture.startsWith(API_BASE_URL)
  ) {
    return picture;
  }

  if (picture.startsWith('/')) {
    return `${API_BASE_URL}${picture}`;
  }

  return `${API_BASE_URL}/${picture}`;
}

function getDayEventIds(day: CalendarDay): string[] {
  return [
    ...new Set([
      ...day.completedEventIds,
      ...day.scheduledEventIds,
      ...(day.proposalEventIds ?? []).map(({ eventId }) => eventId),
    ]),
  ];
}

interface EventDayEntry {
  calendarDate: string;
  eventId: string;
}

function collectEventDayEntries(
  calendarDays: CalendarDay[],
  selectedDate?: string
): EventDayEntry[] {
  const entries: EventDayEntry[] = [];
  const seenEventIds = new Set<string>();
  const visibleDays = selectedDate
    ? calendarDays.filter((day) => day.date === selectedDate)
    : calendarDays;

  for (const day of visibleDays) {
    for (const eventId of getDayEventIds(day)) {
      if (!seenEventIds.has(eventId)) {
        seenEventIds.add(eventId);
        entries.push({ calendarDate: day.date, eventId });
      }
    }
  }

  return entries;
}

async function loadMemorySection({
  calendarDate,
  eventId,
}: EventDayEntry): Promise<MemoryEventSection | null> {
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
    address: trimmedLocation && trimmedLocation.length > 0 ? trimmedLocation : undefined,
    date: eventDate,
    time: eventDetails.time,
    eventName,
    photos: memories.map((memory: EventMemoryResponse) => ({
      id: memory.id,
      imageUrl: getMemoryImageUrl(memory),
    })),
  };
}

function getFulfilledSections(
  results: PromiseSettledResult<MemoryEventSection | null>[]
): MemoryEventSection[] {
  if (results.length > 0 && results.every((result) => result.status === 'rejected')) {
    throw results[0].reason;
  }

  return results.flatMap((result) =>
    result.status === 'fulfilled' && result.value !== null ? [result.value] : []
  );
}

export function resolveMemoryCalendarPeriod(
  date?: string,
  monthParam?: string,
  yearParam?: string
) {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month] = date.split('-').map(Number);
    if (year && month >= 1 && month <= 12) {
      return { month, year, selectedDate: date };
    }
  }

  return { ...resolveCalendarMonth(monthParam, yearParam), selectedDate: undefined };
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

export function useGroupMemories({
  groupId,
  date,
  month: monthParam,
  year: yearParam,
}: UseGroupMemoriesParams) {
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

    const { month, year, selectedDate } = resolveMemoryCalendarPeriod(date, monthParam, yearParam);

    try {
      const calendarDays = await getGroupCalendar(groupId, month, year);
      if (requestIdRef.current !== requestId) {
        return;
      }

      const eventDayEntries = collectEventDayEntries(calendarDays, selectedDate);
      const results = await Promise.allSettled(eventDayEntries.map(loadMemorySection));

      if (requestIdRef.current !== requestId) {
        return;
      }

      setSections(sortMemorySections(getFulfilledSections(results), selectedDate));
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

  return { sections, isLoading, errorMessage, reload: loadMemories };
}
