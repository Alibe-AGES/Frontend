import { Avatar } from '@/components/Avatar';
import { EventCard, type EventCardEvent } from '@/components/EventCard';
import { ParticipantAvatars, type ParticipantAnswer } from '@/components/ParticipantAvatars';
import type { EventPresenceAnswer } from '@/server/events';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

export interface GroupDayCarouselPerson {
  id: string;
  name: string;
  /** Full URL of the user photo, or null to show the placeholder. */
  photoUri: string | null;
}

export interface GroupDayCarouselResponse {
  userId: string;
  name: string;
  answer: ParticipantAnswer;
  profilePic?: string | null;
}

/** An event of the day, with who proposed it and how each member answered. */
export interface GroupDayCarouselItem {
  event: EventCardEvent;
  owner: GroupDayCarouselPerson;
  responses: GroupDayCarouselResponse[];
  currentUserAnswer?: string;
}

interface GroupDayCarouselProps {
  items: GroupDayCarouselItem[];
  error: string | null;
  onAvailabilityPress: () => void;
  onPresenceResponse: (eventId: string, answer: EventPresenceAnswer) => Promise<void>;
  pendingEventId?: string | null;
  currentUserId?: string | null;
  testID?: string;
}

interface GroupDayCarouselPageProps {
  item: GroupDayCarouselItem;
  pageWidth: number;
  testID: string;
  currentUserId: string | null;
  pendingEventId: string | null;
  onPresenceResponse: GroupDayCarouselProps['onPresenceResponse'];
}

interface OwnerHighlightProps {
  owner: GroupDayCarouselPerson;
  isCurrentUser: boolean;
  testID: string;
}

function OwnerHighlight({ owner, isCurrentUser, testID }: OwnerHighlightProps) {
  return (
    <View
      className="flex-row items-center gap-3 self-center rounded-full bg-pink py-1 pl-1 pr-5"
      testID={testID}
    >
      <View className="h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-surface">
        <Avatar
          photoUri={owner.photoUri}
          accessibilityLabel={`Foto de ${owner.name}`}
          imageClassName="h-10 w-10 rounded-full"
          iconSize={20}
          fallbackIconName="person-outline"
          fallbackIconColor={theme.colors.wine}
          testID={`${testID}-avatar`}
        />
      </View>
      <View className="shrink">
        <Text className="font-poppins text-xs text-wine">Proposto por</Text>
        <Text
          className="font-poppins-semibold text-sm text-ink"
          numberOfLines={1}
        >
          {isCurrentUser ? 'Você' : owner.name}
        </Text>
      </View>
    </View>
  );
}

function GroupDayCarouselPage({
  item,
  pageWidth,
  testID,
  currentUserId,
  pendingEventId,
  onPresenceResponse,
}: GroupDayCarouselPageProps) {
  return (
    <View
      className="gap-3 px-1"
      style={{ width: pageWidth }}
    >
      <OwnerHighlight
        owner={item.owner}
        isCurrentUser={item.owner.id === currentUserId}
        testID={`${testID}-owner-${item.event.id}`}
      />
      <EventCard
        event={item.event}
        testID={`${testID}-event-${item.event.id}`}
      />
      <ParticipantResponseSection
        item={item}
        currentUserId={currentUserId}
        pendingEventId={pendingEventId}
        onPresenceResponse={onPresenceResponse}
        testID={testID}
      />
    </View>
  );
}

interface PresenceButtonOption {
  answer: EventPresenceAnswer;
  label: string;
  accessibilityLabel: string;
}

const CONFIRM_PRESENCE: PresenceButtonOption = {
  answer: 'yes',
  label: 'Confirmar presença',
  accessibilityLabel: 'Confirmar presença no evento',
};

const CANCEL_PRESENCE: PresenceButtonOption = {
  answer: 'no',
  label: 'Cancelar presença',
  accessibilityLabel: 'Não participar do evento',
};

// Only the action that changes the current answer is offered. The owner starts with "yes", so
// they only see "Cancelar presença"; someone who has not answered yet sees both.
function getPresenceOptions(currentUserAnswer: string | undefined): PresenceButtonOption[] {
  if (currentUserAnswer === 'yes') {
    return [CANCEL_PRESENCE];
  }

  if (currentUserAnswer === 'no') {
    return [CONFIRM_PRESENCE];
  }

  return [CONFIRM_PRESENCE, CANCEL_PRESENCE];
}

function formatLocalDate(date: Date): string {
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hasEventDatePassed(timeslot: string | Date | null | undefined): boolean {
  if (timeslot instanceof Date) {
    return (
      Number.isFinite(timeslot.getTime()) && formatLocalDate(timeslot) < formatLocalDate(new Date())
    );
  }

  const eventDate = /^\d{4}-\d{2}-\d{2}/.exec(timeslot ?? '')?.[0];
  return eventDate !== undefined && eventDate < formatLocalDate(new Date());
}

interface ParticipantResponseSectionProps {
  item: GroupDayCarouselItem;
  currentUserId: string | null;
  pendingEventId: string | null;
  onPresenceResponse: GroupDayCarouselProps['onPresenceResponse'];
  testID: string;
}

function ParticipantResponseSection({
  item,
  currentUserId,
  pendingEventId,
  onPresenceResponse,
  testID,
}: ParticipantResponseSectionProps) {
  const eventId = item.event.id;
  const isPending = pendingEventId === eventId;
  const isPastConfirmedEvent =
    item.event.status === 'confirmed' && hasEventDatePassed(item.event.timeslot);
  const [pressedAnswer, setPressedAnswer] = useState<EventPresenceAnswer | null>(null);
  const buttonClassName = `w-full items-center justify-center rounded-full bg-ink py-4 ${
    isPending ? 'opacity-60' : 'opacity-100'
  }`;

  return (
    <View className="gap-4 pt-2">
      <Text className="text-center font-poppins-semibold text-lg text-wine">
        Status dos participantes
      </Text>
      <ParticipantAvatars
        participants={item.responses.map((response) => ({
          id: response.userId,
          name: response.name,
          profilePic: response.profilePic ?? null,
          answer: response.answer,
        }))}
        currentUserId={currentUserId ?? undefined}
        testID={`${testID}-participants-${eventId}`}
      />
      {!isPastConfirmedEvent ? (
        <View className="gap-3 pt-6">
          {getPresenceOptions(item.currentUserAnswer).map((option) => (
            <Pressable
              key={option.answer}
              accessibilityRole="button"
              accessibilityLabel={option.accessibilityLabel}
              accessibilityState={{ disabled: isPending, busy: isPending }}
              className={buttonClassName}
              disabled={isPending}
              onPress={() => {
                setPressedAnswer(option.answer);
                void onPresenceResponse(eventId, option.answer);
              }}
              testID={`${testID}-presence-${option.answer}-${eventId}`}
            >
              <Text className="font-poppins text-base text-canvas">
                {isPending && pressedAnswer === option.answer ? 'Salvando...' : option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function GroupDayCarousel({
  items,
  error,
  onAvailabilityPress,
  onPresenceResponse,
  pendingEventId = null,
  currentUserId = null,
  testID = 'group-day-carousel',
}: GroupDayCarouselProps) {
  const scrollRef = useRef<ScrollView | null>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const changePage = (nextIndex: number) => {
    setActiveIndex(nextIndex);
    scrollRef.current?.scrollTo({ x: nextIndex * pageWidth, animated: true });
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (pageWidth > 0) {
      setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / pageWidth));
    }
  };

  let carouselContent: ReactNode;
  if (error) {
    carouselContent = (
      <Text
        accessibilityRole="alert"
        className="py-8 text-center font-poppins text-wine"
        testID={`${testID}-error`}
      >
        {error}
      </Text>
    );
  } else if (items.length === 0) {
    carouselContent = (
      <Text className="text-inkSoft py-8 text-center font-poppins">
        Nenhum detalhe disponível para este dia.
      </Text>
    );
  } else {
    carouselContent = (
      <>
        {items.length > 1 ? (
          <View className="flex-row items-center justify-between">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Evento anterior"
              accessibilityState={{ disabled: activeIndex === 0 }}
              className="h-10 w-10 items-center justify-center rounded-full bg-lime"
              disabled={activeIndex === 0}
              onPress={() => {
                changePage(activeIndex - 1);
              }}
              testID={`${testID}-previous`}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={theme.colors.ink}
              />
            </Pressable>
            <Text
              className="font-poppins-semibold text-sm text-ink"
              testID={`${testID}-page-indicator`}
            >
              {`${String(activeIndex + 1)} / ${String(items.length)}`}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Próximo evento"
              accessibilityState={{ disabled: activeIndex === items.length - 1 }}
              className="h-10 w-10 items-center justify-center rounded-full bg-lime"
              disabled={activeIndex === items.length - 1}
              onPress={() => {
                changePage(activeIndex + 1);
              }}
              testID={`${testID}-next`}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.colors.ink}
              />
            </Pressable>
          </View>
        ) : null}

        <View
          onLayout={(event) => {
            const measuredWidth = event.nativeEvent.layout.width;
            setPageWidth((currentWidth) =>
              currentWidth === measuredWidth ? currentWidth : measuredWidth
            );
          }}
        >
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            testID={`${testID}-pages`}
          >
            {items.map((item) => (
              <GroupDayCarouselPage
                key={item.event.id}
                item={item}
                pageWidth={pageWidth}
                testID={testID}
                currentUserId={currentUserId}
                pendingEventId={pendingEventId}
                onPresenceResponse={onPresenceResponse}
              />
            ))}
          </ScrollView>
        </View>
      </>
    );
  }

  return (
    <View
      className="gap-3 rounded-3xl bg-canvas"
      testID={testID}
    >
      <Pressable
        accessibilityRole="button"
        className="mb-4 self-center rounded-full bg-pink px-5 py-3"
        onPress={onAvailabilityPress}
        testID={`${testID}-availability`}
      >
        <Text className="font-poppins-semibold text-sm text-ink">Ver disponibilidade</Text>
      </Pressable>
      <View className="mb-2 flex-row items-center">
        <Text className="font-poppins-semibold text-lg text-wine">
          {items.length > 1 ? `${String(items.length)} eventos` : 'Detalhes do dia'}
        </Text>
      </View>

      {carouselContent}
    </View>
  );
}
