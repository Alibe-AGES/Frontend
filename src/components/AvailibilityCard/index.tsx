import { UseBackStrategyHook } from '@/components/BackButton/BackButton.types';
import { useDefaultBackController } from '@/components/BackButton/controllers/useDefaultBackController';

import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { TimeInput } from '../TimeInput';
import { AvailabilityCardProps } from './Availiability.types';
import { useDefaultAvailabilityController } from './useDefaultAvailiabilityController/useDefaultAvailiabilityController';

export const AvailabilityCard: FC<AvailabilityCardProps> = ({
  title = 'Você estará disponível neste dia?',
  label = 'Disponibilidade',
  useController,
  useCloseController,
  fallbackHref,
  onIntervalsChange,
  className = '',
  testID = 'alibe-availability-card',
}) => {
  const defaultController = useDefaultAvailabilityController({ onIntervalsChange });
  const customStrategy = useController ? useController({ onIntervalsChange }) : null;
  const { intervals, addInterval, removeInterval, updateStartTime, updateEndTime } =
    customStrategy ?? defaultController;

  const defaultCloseStrategy = useDefaultBackController({ fallbackHref });
  const customCloseStrategy: ReturnType<UseBackStrategyHook> | null = useCloseController
    ? useCloseController()
    : null;
  const { handleBack } = customCloseStrategy ?? defaultCloseStrategy;

  return (
    <View
      className={`w-full gap-4 rounded-3xl bg-pink p-6 ${className}`}
      testID={testID}
    >
      <View className="flex-row items-start justify-between">
        <Text className="flex-1 pr-6 text-center font-poppins-bold text-xl text-ink">{title}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          onPress={() => {
            void handleBack();
          }}
          hitSlop={12}
          testID={`${testID}-close`}
        >
          <Ionicons
            name="close"
            size={22}
            color={theme.colors.ink}
          />
        </Pressable>
      </View>

      <Text
        className="text-wine font-poppins-bold text-sm"
        testID={`${testID}-label`}
      >
        {label}
      </Text>

      <View className="gap-3">
        {intervals.map((interval, index) => (
          <View
            key={interval.id}
            className="flex-row items-center gap-2"
            testID={`${testID}-interval-${index.toString()}`}
          >
            <View className="flex-1 gap-2">
              <TimeInput
                placeholder="Horário de início"
                value={interval.startTime}
                onChangeTime={(value) => {
                  updateStartTime(interval.id, value);
                }}
                testID={`${testID}-start-${index.toString()}`}
              />
              <TimeInput
                placeholder="Horário de fim"
                value={interval.endTime}
                onChangeTime={(value) => {
                  updateEndTime(interval.id, value);
                }}
                error={interval.error ?? undefined}
                testID={`${testID}-end-${index.toString()}`}
              />
            </View>

            {index > 0 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Remover intervalo"
                onPress={() => {
                  removeInterval(interval.id);
                }}
                hitSlop={12}
                testID={`${testID}-remove-${index.toString()}`}
              >
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={theme.colors.coral}
                />
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar intervalo"
        onPress={addInterval}
        className="items-center justify-center self-center rounded-full border-2 border-ink px-6 py-3"
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        testID={`${testID}-add-interval`}
      >
        <Text className="font-poppins-semibold text-base text-ink">Adicionar intervalo</Text>
      </Pressable>
    </View>
  );
};
