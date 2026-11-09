import { BackButton } from '@/components/BackButton';
import { GroupDayCarousel, type GroupDayCarouselItem } from '@/components/GroupDayCarousel';
import { ScreenFrame } from '@/components/ScreenFrame';
import type { EventPresenceAnswer } from '@/server/events';
import { theme } from '@/theme';
import { ActivityIndicator, Text, View } from 'react-native';

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
  const dateLabel = date.split('-').reverse().join('/');

  return (
    <ScreenFrame
      testID="group-day-screen"
      floatingChrome
      topFade="header"
      header={
        <View className="flex-row items-center gap-4">
          <BackButton
            fallbackHref={groupId ? `/group/${groupId}` : '/groups'}
            accessibilityLabel="Voltar para o calendário do grupo"
          />
          <Text className="flex-1 font-poppins-semibold text-2xl text-ink">{dateLabel}</Text>
        </View>
      }
    >
      {isLoading ? (
        <View
          className="flex-1 items-center justify-center"
          testID="group-day-loading"
        >
          <ActivityIndicator
            size="large"
            color={theme.colors.ink}
            accessibilityLabel="Carregando informações do dia"
          />
        </View>
      ) : (
        <View className="mb-8 mt-16">
          <GroupDayCarousel
            items={items}
            error={error}
            onAvailabilityPress={onAvailabilityPress}
            onPresenceResponse={onPresenceResponse}
            pendingEventId={pendingEventId}
            currentUserId={currentUserId}
          />
        </View>
      )}
    </ScreenFrame>
  );
}
