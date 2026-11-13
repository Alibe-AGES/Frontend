import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import { TimeInput } from '../TimeInput';
import { AvailabilityCardProps } from './Availability.types';
import { useDefaultAvailabilityController } from './useDefaultAvailabilityController/useDefaultAvailabilityController';

export const AvailabilityCard: FC<AvailabilityCardProps> = ({
  useController,
  onIntervalsChange,
  registeredIntervals,
  allDay = false,
  onAllDayChange,
  allDayDisabled = false,
  className = '',
  testID = 'alibe-availability-card',
}) => {
  const title = 'Você estará \ndisponível neste dia?';
  const label = 'Disponibilidade';

  const defaultController = useDefaultAvailabilityController({
    onIntervalsChange,
    registeredIntervals,
  });
  const customStrategy = useController
    ? useController({ onIntervalsChange, registeredIntervals })
    : null;
  const { intervals, addInterval, removeInterval, updateStartTime, updateEndTime } =
    customStrategy ?? defaultController;

  return (
    <View
      className={`w-full gap-4 rounded-3xl p-6 ${className}`}
      style={{ backgroundColor: theme.colors.pink }}
      testID={testID}
    >
      <Text
        className="text-center font-poppins-medium text-xl text-ink"
        testID={`${testID}-title`}
      >
        {title}
      </Text>

      <View className="gap-2">
        <Text
          className="font-poppins-bold text-sm"
          style={{ color: theme.colors.wine }}
          testID={`${testID}-label`}
        >
          {label}
        </Text>

        {onAllDayChange ? (
          <Pressable
            accessibilityRole="checkbox"
            accessibilityLabel="Disponível o dia todo"
            accessibilityState={{ checked: allDay, disabled: allDayDisabled }}
            className={`flex-row items-center gap-3 rounded-full bg-surface px-5 py-2 ${
              allDayDisabled ? 'opacity-50' : 'opacity-100'
            }`}
            disabled={allDayDisabled}
            onPress={() => {
              onAllDayChange(!allDay);
            }}
            testID={`${testID}-all-day`}
          >
            <Ionicons
              name={allDay ? 'checkbox' : 'square-outline'}
              size={20}
              color={theme.colors.wine}
            />
            <Text className="flex-1 font-poppins text-base text-wine">Disponível o dia todo</Text>
          </Pressable>
        ) : null}

        {/* The typed times live in the controller, so unchecking "all day" brings them back. */}
        {allDay ? null : (
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
                        className="h-6 w-6 items-center justify-center rounded-full bg-surface"
                        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                        testID={`${testID}-remove-${index.toString()}`}
                      >
                        <Ionicons
                          name="close"
                          size={14}
                          color={theme.colors.wine}
                        />
                      </Pressable>
                    </View>
                  ) : null}

                  <View className="gap-2">
                    <TimeInput
                      placeholder="Horário de início"
                      value={interval.startTime}
                      // The message shows once, under the end time, but both fields turn red.
                      invalid={Boolean(interval.error)}
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
        )}
      </View>

      {allDay ? null : (
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
      )}
    </View>
  );
};
