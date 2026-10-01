import { Calendar } from '@/components/Calendar';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface DatePickerSheetProps {
  visible: boolean;
  initialDate?: string;
  onSelectDate: (dateString: string) => void;
  onClose: () => void;
}

export function DatePickerSheet({
  visible,
  initialDate,
  onSelectDate,
  onClose,
}: DatePickerSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
      testID="date-picker-sheet"
    >
      <View className="flex-1 justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar calendário"
          className="absolute inset-0 bg-ink/40"
          onPress={onClose}
          testID="date-picker-backdrop"
        />
        <View
          className="rounded-t-3xl bg-canvas px-6 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 24) }}
        >
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-poppins-semibold text-xl text-ink">Selecione o dia</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar calendário"
              hitSlop={12}
              onPress={onClose}
              testID="date-picker-close"
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.ink}
              />
            </Pressable>
          </View>
          <Calendar
            initialDate={initialDate}
            onDayPress={onSelectDate}
            testID="date-picker-calendar"
          />
        </View>
      </View>
    </Modal>
  );
}
