import { EventCard, type EventCardEvent } from '@/components/EventCard';
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
    responses: { userId: string; name: string; answer: string }[];
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
  testID?: string;
}

function getResponseLabel(answer: string): string {
  if (answer === 'yes') return 'Vai participar';
  if (answer === 'no') return 'Não vai participar';
  return 'Pendente';
}

export function GroupDayCarousel({
  date,
  items,
  isLoading,
  error,
  onAvailabilityPress,
  onPresenceResponse,
  pendingEventId = null,
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
                  <View className="bg-limeSoft gap-2 rounded-2xl p-3">
                    <Text className="font-poppins-semibold text-sm text-ink">
                      Status dos participantes
                    </Text>
                    {item.proposal.responses.map((response) => (
                      <Text
                        key={response.userId}
                        className="font-poppins text-sm text-ink"
                      >
                        {response.name}: {getResponseLabel(response.answer)}
                      </Text>
                    ))}
                    <Text className="text-inkSoft font-poppins text-sm">
                      Proposta de {item.proposal.ownerName}
                    </Text>
                    <View className="flex-row gap-2 pt-1">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Confirmar presença no evento"
                        accessibilityState={{
                          selected: item.proposal.currentUserAnswer === 'yes',
                          disabled: pendingEventId === item.event.id,
                        }}
                        className={`flex-1 items-center rounded-full px-3 py-3 ${
                          item.proposal.currentUserAnswer === 'yes' ? 'bg-ink' : 'bg-canvas'
                        }`}
                        disabled={pendingEventId === item.event.id}
                        onPress={() => {
                          void onPresenceResponse(item.event.id, 'yes');
                        }}
                        testID={`${testID}-presence-yes-${item.event.id}`}
                      >
                        <Text
                          className={`font-poppins-semibold text-sm ${
                            item.proposal.currentUserAnswer === 'yes' ? 'text-canvas' : 'text-ink'
                          }`}
                        >
                          {pendingEventId === item.event.id ? 'Salvando...' : 'Vou participar'}
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Não participar do evento"
                        accessibilityState={{
                          selected: item.proposal.currentUserAnswer === 'no',
                          disabled: pendingEventId === item.event.id,
                        }}
                        className={`flex-1 items-center rounded-full px-3 py-3 ${
                          item.proposal.currentUserAnswer === 'no' ? 'bg-wine' : 'bg-canvas'
                        }`}
                        disabled={pendingEventId === item.event.id}
                        onPress={() => {
                          void onPresenceResponse(item.event.id, 'no');
                        }}
                        testID={`${testID}-presence-no-${item.event.id}`}
                      >
                        <Text
                          className={`font-poppins-semibold text-sm ${
                            item.proposal.currentUserAnswer === 'no' ? 'text-canvas' : 'text-ink'
                          }`}
                        >
                          Não vou
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
      className="gap-3 rounded-3xl bg-surface p-4"
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
