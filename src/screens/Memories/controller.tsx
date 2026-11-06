import { DayMark } from '@/components/Calendar/Calendar.types';
import { formatCalendarDate } from '@/components/Calendar/calendar.utils';
import { API_BASE_URL } from '@/constants';
import { MemoriesScreen } from '@/screens/Memories';
import { CalendarDay, getGroupCalendar } from '@/server/calendar';
import { EventMemoryResponse, getEventMemories } from '@/server/events';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';

const LOAD_ERROR = 'Não foi possível carregar as memórias do calendário.';

export function resolveMemoryImageUrl(picture: string): string {
  if (picture.startsWith('http')) {
    return picture;
  }

  return `${API_BASE_URL}${picture.startsWith('/') ? '' : '/'}${picture}`;
}

export function getDayEventIds(day: CalendarDay): string[] {
  return [
    ...new Set([
      ...day.completedEventIds,
      ...day.scheduledEventIds,
      ...(day.proposalEventIds ?? []).map(({ eventId }) => eventId),
    ]),
  ];
}

export default function MemoriesController() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  const requestIdRef = useRef(0);
  const [initialDate] = useState(() => formatCalendarDate(new Date()));
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  });
  const [dayMarks, setDayMarks] = useState<Record<string, DayMark>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadCalendarMemories = useCallback(async () => {
    if (!groupId) {
      setDayMarks({});
      setIsLoading(false);
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const calendarDays = await getGroupCalendar(groupId, visibleMonth.month, visibleMonth.year);
      if (requestIdRef.current !== requestId) {
        return;
      }

      const days = calendarDays
        .map((day) => ({ date: day.date, eventIds: getDayEventIds(day) }))
        .filter(({ eventIds }) => eventIds.length > 0);
      const uniqueEventIds = [...new Set(days.flatMap(({ eventIds }) => eventIds))];

      // Um evento com erro não deve derrubar o calendário inteiro.
      const results = await Promise.allSettled(
        uniqueEventIds.map((eventId) => getEventMemories(eventId))
      );

      if (requestIdRef.current !== requestId) {
        return;
      }

      const memoriesByEventId = new Map<string, EventMemoryResponse[]>();
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          memoriesByEventId.set(uniqueEventIds[index], result.value);
        }
      });

      const nextMarks: Record<string, DayMark> = {};
      for (const { date, eventIds } of days) {
        const dayMemories = eventIds.flatMap((eventId) => memoriesByEventId.get(eventId) ?? []);

        if (dayMemories.length > 0) {
          nextMarks[date] = {
            status: 'realized',
            eventIds,
            memoryIds: dayMemories.map((memory) => memory.id),
            imageUrl: resolveMemoryImageUrl(dayMemories[0].picture),
          };
        }
      }
      setDayMarks(nextMarks);
    } catch (error: unknown) {
      if (requestIdRef.current !== requestId) {
        return;
      }
      console.error('Erro ao carregar o calendário de memórias', error);
      setErrorMessage(LOAD_ERROR);
    } finally {
      if (requestIdRef.current === requestId) {
        setIsLoading(false);
      }
    }
  }, [groupId, visibleMonth.month, visibleMonth.year]);

  useEffect(() => {
    void loadCalendarMemories();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadCalendarMemories]);

  const handleMonthChange = (dateString: string) => {
    const [year, month] = dateString.split('-').map(Number);

    if (!year || !month) {
      return;
    }

    setVisibleMonth({ month, year });
  };

  const handleDayPress = (dateString: string) => {
    if (!groupId) {
      return;
    }

    router.push({
      pathname: '/group/[id]/memories/gallery',
      params: { id: groupId, date: dateString },
    });
  };

  const handleSeeAllPress = () => {
    if (!groupId) {
      return;
    }

    router.push({
      pathname: '/group/[id]/memories/gallery',
      params: {
        id: groupId,
        month: String(visibleMonth.month),
        year: String(visibleMonth.year),
      },
    });
  };

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
    <MemoriesScreen
      groupId={groupId}
      initialDate={initialDate}
      dayMarks={dayMarks}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onDayPress={handleDayPress}
      onMonthChange={handleMonthChange}
      onSeeAllPress={handleSeeAllPress}
      onAddMemory={handleAddMemory}
      onRetry={() => {
        void loadCalendarMemories();
      }}
    />
  );
}
