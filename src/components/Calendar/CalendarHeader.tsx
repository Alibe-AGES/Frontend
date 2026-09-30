import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import { theme } from '@/theme';

interface CalendarHeaderProps {
  monthDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({ monthDate, onPreviousMonth, onNextMonth }: CalendarHeaderProps) {
  return (
    <View className="w-3/4 flex-row items-center justify-between rounded-full bg-pink px-2 py-1">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mês anterior"
        className="h-9 w-9 items-center justify-center"
        onPress={onPreviousMonth}
        testID="calendar-previous-month"
      >
        <Ionicons
          name="chevron-back"
          size={20}
          color={theme.colors.ink}
        />
      </Pressable>

      <View className="flex-1 items-center rounded-full bg-pink px-3 py-2">
        <Text className="font-poppins-bold text-base capitalize text-ink">
          {monthDate.toLocaleDateString('pt-BR', { month: 'long' })}
        </Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Próximo mês"
        className="h-9 w-9 items-center justify-center"
        onPress={onNextMonth}
        testID="calendar-next-month"
      >
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.ink}
        />
      </Pressable>
    </View>
  );
}
