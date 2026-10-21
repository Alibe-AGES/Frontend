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

export interface GroupDayCarouselItem {
  kind: 'event' | 'proposal';
  event: EventCardEvent;
  proposal?: {
    ownerName: string;
    responses: {
      userId: string;
      name: string;
      answer: ParticipantAnswer;
      profilePic?: string | null;
    }[];
    currentUserAnswer?: string;
  };
}

interface GroupDayCarouselProps {
  date: string;
  items: GroupDayCarouselItem[];
  isLoading: boolean;
  error: string | null;
  onAvailabilityPress: () => void;
  onPresenceResponse: (eventId: string, answer: EventPresenceAnswer) => Promise<void>;
  pendingEventId?: string | null;
  currentUserId?: string | null;
  testID?: string;
}

export function GroupDayCarousel({
  date,
  items,
  isLoading,
  error,
  onAvailabilityPress,
  onPresenceResponse,
  pendingEventId = null,
  currentUserId = null,
  testID = 'group-day-carousel',
}: GroupDayCarouselProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const dateLabel = date.split('-').reverse().join('/');

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
  if (isLoading) {
    carouselContent = (
      <Text
        className="text-inkSoft py-8 text-center font-poppins"
        testID={`${testID}-loading`}
      >
        Carregando informações do dia...
      </Text>
    );
  } else if (error) {
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
              accessibilityLabel="Item anterior"
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
              accessibilityLabel="Próximo item"
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
            {items.map((item, index) => (
              <View
                key={`${item.kind}-${item.event.id}-${String(index)}`}
                className="gap-3 px-1"
                style={{ width: pageWidth }}
              >
                <Text className="text-center font-poppins-semibold text-sm text-wine">
                  {item.kind === 'proposal' ? 'Proposta' : 'Encontro'}
                </Text>
                <EventCard
                  event={item.event}
                  testID={`${testID}-${item.kind}-${item.event.id}`}
                />
                {item.proposal ? (
                  <View className="gap-4 pt-2">
                    <Text className="text-center font-poppins-semibold text-lg text-wine">
                      Status dos participantes
                    </Text>
                    <ParticipantAvatars
                      participants={item.proposal.responses.map((response) => ({
                        id: response.userId,
                        name: response.name,
                        profilePic: response.profilePic ?? null,
                        answer: response.answer,
                      }))}
                      currentUserId={currentUserId ?? undefined}
                      testID={`${testID}-participants-${item.event.id}`}
                    />
                    <View className="gap-3 pt-2">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Confirmar presença no evento"
                        accessibilityState={{
                          selected: item.proposal.currentUserAnswer === 'yes',
                          disabled: pendingEventId === item.event.id,
                        }}
                        className={`w-full items-center justify-center rounded-full bg-ink py-4 ${
                          pendingEventId === item.event.id ? 'opacity-60' : 'opacity-100'
                        }`}
                        disabled={pendingEventId === item.event.id}
                        onPress={() => {
                          void onPresenceResponse(item.event.id, 'yes');
                        }}
                        testID={`${testID}-presence-yes-${item.event.id}`}
                      >
                        <Text className="font-poppins text-base text-canvas">
                          {pendingEventId === item.event.id ? 'Salvando...' : 'Confirmar!'}
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Não participar do evento"
                        accessibilityState={{
                          selected: item.proposal.currentUserAnswer === 'no',
                          disabled: pendingEventId === item.event.id,
                        }}
                        className={`w-full items-center justify-center rounded-full bg-ink py-4 ${
                          pendingEventId === item.event.id ? 'opacity-60' : 'opacity-100'
                        }`}
                        disabled={pendingEventId === item.event.id}
                        onPress={() => {
                          void onPresenceResponse(item.event.id, 'no');
                        }}
                        testID={`${testID}-presence-no-${item.event.id}`}
                      >
                        <Text className="font-poppins text-base text-canvas">
                          Não estarei disponível neste dia
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </>
    );
  }

  return (
    <View
      className="gap-3 rounded-3xl bg-canvas p-4"
      testID={testID}
    >
      <View className="flex-row items-center justify-between gap-3">
        <View>
          <Text className="font-poppins-semibold text-lg text-ink">{dateLabel}</Text>
          <Text className="text-inkSoft font-poppins text-sm">
            {items.length > 1 ? `${String(items.length)} itens` : 'Detalhes do dia'}
          </Text>
        </View>
      </View>

      {carouselContent}

      <Pressable
        accessibilityRole="button"
        className="self-center rounded-full bg-pink px-5 py-3"
        onPress={onAvailabilityPress}
        testID={`${testID}-availability`}
      >
        <Text className="font-poppins-semibold text-sm text-ink">Ver disponibilidade</Text>
      </Pressable>
    </View>
  );
}
