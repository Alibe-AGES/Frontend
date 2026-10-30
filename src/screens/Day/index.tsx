import { BackButton } from '@/components/BackButton';
import { GroupDayCarousel, type GroupDayCarouselItem } from '@/components/GroupDayCarousel';
import { NavigationBar } from '@/components/NavigationBar';
import { ScreenFrame } from '@/components/ScreenFrame';
import type { EventPresenceAnswer } from '@/server/events';
import { Text, View } from 'react-native';

interface DayScreenProps {
  groupId?: string;
  date: string;
  items: GroupDayCarouselItem[];
  isLoading: boolean;
  error: string | null;
  onAvailabilityPress: () => void;
  onPresenceResponse: (eventId: string, answer: EventPresenceAnswer) => Promise<void>;
  pendingEventId: string | null;
  currentUserId?: string | null;
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
  currentUserId,
}: DayScreenProps) {
  return (
    <ScreenFrame
      gap="lg"
      footer={groupId ? <NavigationBar groupId={groupId} /> : undefined}
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
        currentUserId={currentUserId}
      />
    </ScreenFrame>
  );
}
