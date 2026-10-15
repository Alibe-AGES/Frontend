import { BackButton } from '@/components/BackButton';
import { GroupDayCarousel, type GroupDayCarouselItem } from '@/components/GroupDayCarousel';
import { NavigationBar } from '@/components/NavigationBar';
import type { EventPresenceAnswer } from '@/server/events';
import { ScrollView, Text, View } from 'react-native';

interface DayScreenProps {
  groupId?: string;
  date: string;
  items: GroupDayCarouselItem[];
  isLoading: boolean;
  error: string | null;
  onAvailabilityPress: () => void;
  onPresenceResponse: (eventId: string, answer: EventPresenceAnswer) => Promise<void>;
  pendingEventId: string | null;
}

export function DayScreen({
  groupId,
  date,
  items,
  isLoading,
  error,
  onAvailabilityPress,
  onPresenceResponse,
  pendingEventId,
}: DayScreenProps) {
  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-32 pt-16"
        contentInsetAdjustmentBehavior="automatic"
        testID="group-day-screen"
      >
        <View className="flex-row items-center gap-4">
          <BackButton
            fallbackHref={groupId ? `/group/${groupId}` : '/groups'}
            accessibilityLabel="Voltar para o calendário do grupo"
          />
          <Text className="flex-1 font-poppins-semibold text-2xl text-ink">Detalhes do dia</Text>
        </View>

        <GroupDayCarousel
          date={date}
          items={items}
          isLoading={isLoading}
          error={error}
          onAvailabilityPress={onAvailabilityPress}
          onPresenceResponse={onPresenceResponse}
          pendingEventId={pendingEventId}
        />
      </ScrollView>

      {groupId ? (
        <View className="absolute inset-x-0 bottom-0">
          <NavigationBar groupId={groupId} />
        </View>
      ) : null}
    </View>
  );
}
