import { Button } from '@/components/Button';
import { Calendar } from '@/components/Calendar';
import { DayMark } from '@/components/Calendar/Calendar.types';
import { NavigationBar } from '@/components/NavigationBar';
import { ScreenFrame } from '@/components/ScreenFrame';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import tw from 'twrnc';

export interface MemoriesScreenProps {
  groupId: string;
  initialDate?: string;
  dayMarks: Record<string, DayMark>;
  isLoading?: boolean;
  errorMessage?: string | null;
  onDayPress: (dateString: string) => void;
  onMonthChange: (dateString: string) => void;
  onSeeAllPress: () => void;
  onAddMemory: () => void;
  onRetry?: () => void;
}

export function MemoriesScreen({
  groupId,
  initialDate,
  dayMarks,
  isLoading,
  errorMessage,
  onDayPress,
  onMonthChange,
  onSeeAllPress,
  onAddMemory,
  onRetry,
}: Readonly<MemoriesScreenProps>) {
  return (
    <ScreenFrame
      gap="lg"
      footer={groupId ? <NavigationBar groupId={groupId} /> : undefined}
      testID="memories-screen"
    >
      <View className="flex-row items-center justify-end">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Adicionar memória"
          hitSlop={12}
          onPress={onAddMemory}
          className="h-7 w-7 items-center justify-center rounded-full bg-ink"
          style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
          testID="memories-add"
        >
          <Ionicons
            name="add"
            size={18}
            color={theme.colors.white}
          />
        </Pressable>
      </View>

      <Text className="text-center font-poppins-medium text-3xl text-wine">Suas memórias</Text>

      <Button
        title="Ver todas"
        variant="tertiary"
        onPress={onSeeAllPress}
        testID="memories-see-all"
      />

      <Text className="text-center font-poppins text-base text-wine">
        Ou procure pela data do evento
      </Text>

      {isLoading ? (
        <ActivityIndicator
          color={theme.colors.ink}
          accessibilityLabel="Carregando memórias"
          testID="memories-loading"
        />
      ) : null}

      {/* TODO: carrossel com MemoryCard, aguardando MR da ALI-119 (feature/ali-119-criacao-de-componente-card-de-memoria) */}

      {errorMessage ? (
        <View
          className="items-center gap-3"
          testID="memories-error"
        >
          <Text className="text-center font-poppins text-sm text-wine">{errorMessage}</Text>
          {onRetry ? (
            <Button
              title="Tentar de novo"
              variant="secondary"
              onPress={onRetry}
              testID="memories-retry"
            />
          ) : null}
        </View>
      ) : null}

      <Calendar
        initialDate={initialDate}
        dayMarks={dayMarks}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        testID="memories-calendar"
      />
    </ScreenFrame>
  );
}
