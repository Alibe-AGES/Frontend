import { type GroupDayCarouselItem } from '@/components/GroupDayCarousel';
import { API_BASE_URL } from '@/constants';
import { CalendarDay, getGroupCalendar } from '@/server/calendar';
import {
  EventDetailsResponse,
  EventPresenceAnswer,
  getEventDetails,
  getProposalDetails,
  ProposalDetailsResponse,
  respondToSuggestion,
  respondToEventProposal,
} from '@/server/events';
import { getGroupMembers, getMe, type GroupMember } from '@/server/groups';
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

function mapEventToCarouselItem(
  event: EventDetailsResponse,
  kind: GroupDayCarouselItem['kind'],
  currentUserId: string | null,
  groupMembers: GroupMember[]
): GroupDayCarouselItem {
  const imageUrl = event.image ? `${API_BASE_URL}${event.image}` : null;
  const timeslot = event.date && event.time ? `${event.date}T${event.time}:00` : null;

  return {
    kind,
    event: {
      id: event.id,
      name: event.name,
      timeslot,
      budgetStart: event.budgetStart,
      budgetEnd: event.budgetEnd,
      status: event.status,
      location: { address: event.location?.description },
      imageUrl,
    },
    proposal: {
      ownerName: event.proposal.owner.name,
      currentUserAnswer: event.proposal.responses.find(
        (response) => response.user.id === currentUserId
      )?.answer,
      responses: groupMembers.map((member) => {
        const response = event.proposal.responses.find((item) => item.user.id === member.id);
        return {
          userId: member.id,
          name: member.name,
          profilePic: member.profilePic,
          answer: response?.answer ?? 'pending',
        };
      }),
    },
  };
}

function mapSuggestionToCarouselItem(
  suggestion: ProposalDetailsResponse,
  currentUserId: string | null,
  groupMembers: GroupMember[]
): GroupDayCarouselItem {
  const location = suggestion.location;
  return {
    kind: 'locationSuggestion',
    event: {
      id: `suggestion-${suggestion.id}`,
      name: suggestion.name ?? location?.name,
      timeslot: suggestion.date ? `${suggestion.date}T00:00:00` : null,
      budgetStart: location?.priceRange.start,
      budgetEnd: location?.priceRange.end,
      status: 'pending',
      location: { address: location?.address ?? location?.description },
      imageUrl: location?.imageUrl ? `${API_BASE_URL}${location.imageUrl}` : null,
      phone: location?.phoneNumber,
      openingHours: location?.openingHours,
      website: location?.website,
    },
    proposal: {
      proposalId: suggestion.id,
      ownerName: suggestion.owner.name,
      currentUserAnswer: suggestion.myAnswer ?? undefined,
      responses: groupMembers.map((member) => ({
        userId: member.id,
        name: member.name,
        profilePic: member.profilePic,
        answer: getSuggestionMemberAnswer(member.id, suggestion, currentUserId),
      })),
    },
  };
}

function getSuggestionMemberAnswer(
  memberId: string,
  suggestion: ProposalDetailsResponse,
  currentUserId: string | null
): 'yes' | 'no' | 'pending' {
  if (memberId === suggestion.owner.id) return 'yes';
  if (memberId !== currentUserId) return 'pending';
  if (suggestion.myAnswer === 'yes' || suggestion.myAnswer === 'no') {
    return suggestion.myAnswer;
  }
  return 'pending';
}

export default function DayController() {
  const router = useRouter();
  const { id: groupId, date } = useLocalSearchParams<{ id: string; date: string }>();
  const requestIdRef = useRef(0);
  const [calendarDay, setCalendarDay] = useState<CalendarDay | null>(null);
  const [eventDetails, setEventDetails] = useState<EventDetailsResponse[]>([]);
  const [suggestionDetails, setSuggestionDetails] = useState<ProposalDetailsResponse[]>([]);
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
        setCalendarDay(null);
        setEventDetails([]);
        setSuggestionDetails([]);
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

        setCalendarDay(selectedDay);
        setCurrentUserId(user?.id ?? null);
        setGroupMembers(members);
        if (!selectedDay) {
          setEventDetails([]);
          setSuggestionDetails([]);
          return;
        }

        const [details, suggestions] = await Promise.all([
          Promise.all(getEventIds(selectedDay).map((eventId) => getEventDetails(eventId))),
          Promise.all((selectedDay.suggestionIds ?? []).map((id) => getProposalDetails(id))),
        ]);
        if (requestIdRef.current !== requestId) {
          return;
        }
        setEventDetails(details);
        setSuggestionDetails(suggestions);
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

  const handleSuggestionResponse = async (
    proposalId: string,
    answer: EventPresenceAnswer
  ): Promise<void> => {
    const suggestion = suggestionDetails.find((item) => item.id === proposalId);
    if (!suggestion || !currentUserId) return;

    const pendingKey = `suggestion-${proposalId}`;
    setPendingEventId(pendingKey);
    try {
      const response = await respondToSuggestion(proposalId, answer, suggestion.myAnswer !== null);
      if (response.matched) {
        router.push({
          pathname: '/group/[id]/match/[proposalId]',
          params: { id: groupId, proposalId },
        });
        return;
      }

      const updatedSuggestion = await getProposalDetails(proposalId);
      setSuggestionDetails((current) =>
        current.map((item) => (item.id === proposalId ? updatedSuggestion : item))
      );
    } catch (responseError: unknown) {
      console.error('Erro ao responder à sugestão', responseError);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível responder à sugestão. Tente novamente.',
      });
    } finally {
      setPendingEventId(null);
    }
  };

  const items: GroupDayCarouselItem[] = calendarDay
    ? [
        ...calendarDay.scheduledEventIds.flatMap((eventId) => {
          const event = eventDetails.find((detail) => detail.id === eventId);
          return event ? [mapEventToCarouselItem(event, 'event', currentUserId, groupMembers)] : [];
        }),
        ...calendarDay.completedEventIds.flatMap((eventId) => {
          const event = eventDetails.find((detail) => detail.id === eventId);
          return event ? [mapEventToCarouselItem(event, 'event', currentUserId, groupMembers)] : [];
        }),
        ...(calendarDay.proposalEventIds ?? []).flatMap(({ proposalId, eventId }) => {
          const event = eventDetails.find(
            (detail) => detail.id === eventId && detail.proposal.id === proposalId
          );
          return event
            ? [mapEventToCarouselItem(event, 'proposal', currentUserId, groupMembers)]
            : [];
        }),
        ...suggestionDetails
          .filter((suggestion) => !suggestion.matched)
          .map((suggestion) =>
            mapSuggestionToCarouselItem(suggestion, currentUserId, groupMembers)
          ),
      ]
    : [];

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
      onSuggestionResponse={handleSuggestionResponse}
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
