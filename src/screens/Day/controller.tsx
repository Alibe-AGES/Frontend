import { type GroupDayCarouselItem } from '@/components/GroupDayCarousel';
import { CalendarDay, getGroupCalendar } from '@/server/calendar';
import {
  EventDetailsResponse,
  EventPresenceAnswer,
  getEventDetails,
  respondToEventProposal,
} from '@/server/events';
import { getGroupMembers, getMe, type GroupMember } from '@/server/groups';
import { getStoredLocationDetails, type PlaceDetails } from '@/server/places';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import Toast from 'react-native-toast-message';
import { DayScreen } from '.';

function getEventIds(day: CalendarDay): string[] {
  return [
    ...new Set([
      ...day.scheduledEventIds,
      ...day.completedEventIds,
      ...(day.proposalEventIds ?? []).map(({ eventId }) => eventId),
    ]),
  ];
}

/**
 * Saved locations have details that are not included in the event response.
 */
async function loadLocationDetails(
  events: EventDetailsResponse[]
): Promise<Record<string, PlaceDetails>> {
  const locationIds = [
    ...new Set(events.flatMap((event) => (event.location ? [event.location.id] : []))),
  ];
  const entries = await Promise.all(
    locationIds.map(async (locationId) => {
      try {
        const details = await getStoredLocationDetails(locationId);
        return [[locationId, details] as const];
      } catch (error: unknown) {
        console.warn('Erro ao buscar detalhes do local', error);
        return [];
      }
    })
  );
  return Object.fromEntries(entries.flat());
}

function mapEventToCarouselItem(
  event: EventDetailsResponse,
  currentUserId: string | null,
  groupMembers: GroupMember[],
  locationsById: Record<string, PlaceDetails>
): GroupDayCarouselItem {
  const timeslot = event.date && event.time ? `${event.date}T${event.time}:00` : null;
  const { owner, responses } = event.proposal;
  const location = event.location ? locationsById[event.location.id] : undefined;
  const hasEventBudget = event.budgetStart != null || event.budgetEnd != null;

  return {
    event: {
      id: event.id,
      name: event.name,
      timeslot,
      budgetStart: hasEventBudget ? event.budgetStart : location?.priceRange?.start,
      budgetEnd: hasEventBudget ? event.budgetEnd : location?.priceRange?.end,
      status: event.status,
      location: {
        address: location?.address ?? event.location?.description,
      },
      imageUrl: event.image ?? location?.imageUrl,
      phone: location?.phoneNumber,
      openingHours: location?.openingHours,
      website: location?.website,
    },
    owner: { id: owner.id, name: owner.name, photoUri: owner.image },
    currentUserAnswer: responses.find((response) => response.user.id === currentUserId)?.answer,
    responses: groupMembers.map((member) => {
      const response = responses.find((item) => item.user.id === member.id);
      return {
        userId: member.id,
        name: member.name,
        profilePic: member.profilePic,
        answer: response?.answer ?? 'pending',
      };
    }),
  };
}

// Events of the day in chronological order; those without a time go last.
function compareByTime(first: EventDetailsResponse, second: EventDetailsResponse) {
  return (first.time ?? '99:99').localeCompare(second.time ?? '99:99');
}

export default function DayController() {
  const router = useRouter();
  const { id: groupId, date } = useLocalSearchParams<{ id: string; date: string }>();
  const requestIdRef = useRef(0);
  const [eventDetails, setEventDetails] = useState<EventDetailsResponse[]>([]);
  const [locationsById, setLocationsById] = useState<Record<string, PlaceDetails>>({});
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingEventId, setPendingEventId] = useState<string | null>(null);

  useEffect(() => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const [year, month] = date.split('-').map(Number);

    async function loadDayDetails() {
      if (!groupId || !year || !month || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        setEventDetails([]);
        setError('Data inválida para carregar os detalhes do dia.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const [days, members] = await Promise.all([
          getGroupCalendar(groupId, month, year),
          getGroupMembers(groupId),
        ]);
        const user = await getMe().catch(() => null);
        const selectedDay = days.find((day) => day.date === date) ?? null;
        if (requestIdRef.current !== requestId) {
          return;
        }

        setCurrentUserId(user?.id ?? null);
        setGroupMembers(members);
        if (!selectedDay) {
          setEventDetails([]);
          return;
        }

        const details = await Promise.all(
          getEventIds(selectedDay).map((eventId) => getEventDetails(eventId))
        );
        const locations = await loadLocationDetails(details);
        if (requestIdRef.current !== requestId) {
          return;
        }
        setLocationsById(locations);
        setEventDetails(details);
      } catch (loadError: unknown) {
        if (requestIdRef.current !== requestId) {
          return;
        }
        console.error('Erro ao buscar detalhes dos encontros do dia', loadError);
        setError('Não foi possível carregar as informações do dia.');
      } finally {
        if (requestIdRef.current === requestId) {
          setIsLoading(false);
        }
      }
    }

    void loadDayDetails();

    return () => {
      if (requestIdRef.current === requestId) {
        requestIdRef.current += 1;
      }
    };
  }, [date, groupId]);

  const handlePresenceResponse = async (eventId: string, answer: EventPresenceAnswer) => {
    const currentEvent = eventDetails.find((event) => event.id === eventId);
    if (!currentEvent || !currentUserId) {
      return;
    }

    setPendingEventId(eventId);
    try {
      const hasExistingResponse = currentEvent.proposal.responses.some(
        (response) => response.user.id === currentUserId
      );
      await respondToEventProposal(eventId, answer, hasExistingResponse);
      const refreshedEvent = await getEventDetails(eventId);
      setEventDetails((currentEvents) =>
        currentEvents.map((event) => (event.id === eventId ? refreshedEvent : event))
      );
    } catch (responseError: unknown) {
      console.error('Erro ao salvar a resposta de presença', responseError);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar sua resposta. Tente novamente.',
      });
    } finally {
      setPendingEventId(null);
    }
  };

  const items: GroupDayCarouselItem[] = [...eventDetails]
    .sort(compareByTime)
    .map((event) => mapEventToCarouselItem(event, currentUserId, groupMembers, locationsById));

  return (
    <DayScreen
      groupId={groupId}
      date={eventDetails.find((event) => event.date)?.date ?? date}
      items={items}
      isLoading={isLoading}
      error={error}
      pendingEventId={pendingEventId}
      currentUserId={currentUserId}
      onPresenceResponse={handlePresenceResponse}
      onAvailabilityPress={() => {
        if (groupId) {
          router.push({
            pathname: '/group/[id]/day/[date]/availability',
            params: { id: groupId, date },
          });
        }
      }}
    />
  );
}
