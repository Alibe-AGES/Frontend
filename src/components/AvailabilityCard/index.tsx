import { UseBackStrategyHook } from '@/components/BackButton/BackButton.types';
import { useDefaultBackController } from '@/components/BackButton/controllers/useDefaultBackController';

import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { TimeInput } from '../TimeInput';
import { AvailabilityCardProps } from './Availability.types';
import { useDefaultAvailabilityController } from './useDefaultAvailabilityController/useDefaultAvailabilityController';

export const AvailabilityCard: FC<AvailabilityCardProps> = ({
  useController,
  useCloseController,
  fallbackHref,
  onIntervalsChange,
  className = '',
  testID = 'alibe-availability-card',
}) => {
  const title = 'Você estará \ndisponível neste dia?';
  const label = 'Disponibilidade';

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
      className={`w-full gap-4 rounded-3xl p-6 ${className}`}
      style={{ backgroundColor: theme.colors.pink }}
      testID={testID}
    >
      <View className="flex-row items-start justify-between">
        <View style={{ width: 22 }} />
        <Text
          className="flex-1 text-center font-poppins-medium text-xl text-ink"
          style={{ color: theme.colors.ink }}
        >
          {title}
        </Text>
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

      <View className="gap-2">
        <Text
          className="font-poppins-bold text-sm"
          style={{ color: theme.colors.wine }}
          testID={`${testID}-label`}
        >
          {label}
        </Text>

        <View className="gap-3">
          {intervals.map((interval, index) => {
            const isAdditionalInterval = index > 0;
            return (
              <View
                key={interval.id}
                className={`gap-2 rounded-2xl ${isAdditionalInterval ? 'p-3' : ''}`}
                style={
                  isAdditionalInterval ? { backgroundColor: 'rgba(255,255,255,0.4)' } : undefined
                }
                testID={`${testID}-interval-${index.toString()}`}
              >
                {isAdditionalInterval ? (
                  <View className="flex-row justify-end">
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Remover intervalo ${(index + 1).toString()}`}
                      onPress={() => {
                        removeInterval(interval.id);
                      }}
                      hitSlop={12}
                      testID={`${testID}-remove-${index.toString()}`}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={theme.colors.coral}
                      />
                    </Pressable>
                  </View>
                ) : null}

                <View className="gap-2">
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
              </View>
            );
          })}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adicionar intervalo"
        onPress={addInterval}
        className="items-center justify-center self-center rounded-full border border-ink px-6 py-3"
        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        testID={`${testID}-add-interval`}
      >
        <Text className="font-poppins text-base text-ink">Adicionar intervalo</Text>
      </Pressable>
    </View>
  );
};
