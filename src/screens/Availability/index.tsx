import { AvailabilityCard } from '@/components/AvailabilityCard';
import type {
  AvailabilityInterval,
  RegisteredInterval,
} from '@/components/AvailabilityCard/Availability.types';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { ScreenFrame } from '@/components/ScreenFrame';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { type AvailabilityParticipant, AvailableParticipants } from './AvailableParticipants';

export interface AvailabilityScreenProps {
  readonly date?: string;
  readonly participants?: AvailabilityParticipant[];
  readonly isLoadingParticipants?: boolean;
  readonly onConfirm?: (intervals: AvailabilityInterval[]) => void | Promise<void>;
}

const WHOLE_DAY: readonly RegisteredInterval[] = [['00:00', '23:59']];
const NO_INTERVALS: readonly RegisteredInterval[] = [];

// What the current user already saved for this day; the card flags new intervals inside it.
function getRegisteredIntervals(
  currentUser: AvailabilityParticipant | undefined
): readonly RegisteredInterval[] {
  if (!currentUser) {
    return NO_INTERVALS;
  }

  return currentUser.availableAllDay ? WHOLE_DAY : currentUser.intervals;
}

const TIME_PATTERN = /^\d{2}:\d{2}$/;

// Every interval needs both times filled in and valid. An empty list means "all day" to the API,
// so it is only sent through the checkbox, never by leaving the fields blank.
function isIntervalComplete(interval: AvailabilityInterval) {
  return (
    TIME_PATTERN.test(interval.startTime) && TIME_PATTERN.test(interval.endTime) && !interval.error
  );
}

export function AvailabilityScreen({
  date,
  participants = [],
  isLoadingParticipants = false,
  onConfirm,
}: AvailabilityScreenProps) {
  const [intervals, setIntervals] = useState<AvailabilityInterval[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAllDay, setIsAllDay] = useState(false);

  const formattedDate = useMemo(() => {
    if (date) {
      const parts = date.split('-');
      if (parts.length === 3) {
        const [, month, day] = parts;
        return `${day}/${month}`;
      }
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  }, [date]);

  const hasParticipants = participants.length > 0;
  const currentUser = participants.find((participant) => participant.isCurrentUser);
  const isAlreadyAllDay = currentUser?.availableAllDay ?? false;
  const registeredIntervals = getRegisteredIntervals(currentUser);
  // Someone already available all day has nothing left to add.
  const canConfirm =
    !isAlreadyAllDay && (isAllDay || (intervals.length > 0 && intervals.every(isIntervalComplete)));

  const handleConfirm = async () => {
    if (!canConfirm || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm?.(isAllDay ? [] : intervals);
      Toast.show({
        type: 'success',
        text1: 'Sucesso!',
        text2: 'Disponibilidade confirmada!',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível confirmar. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenFrame
      gap="lg"
      testID="availability-screen"
      topFade
      floatingChrome
      header={
        <View className="flex-row items-center gap-4">
          <BackButton testID="availability-back-button" />
          <Text
            className="flex-1 font-poppins-semibold text-2xl text-ink"
            testID='testID="availability-title"'
          >
            Disponibilidade
          </Text>
        </View>
      }
    >
      <View className="mt-14 flex-row items-center justify-center gap-10">
        <View
          className="items-center justify-center rounded-full"
          style={{
            backgroundColor: theme.colors.pink,
            height: 60,
            width: 60,
          }}
          testID="availability-screen-date-icon-wrapper"
        >
          <Ionicons
            name="calendar-outline"
            size={40}
            color={theme.colors.ink}
          />
        </View>
        <Text
          className="items-center justify-items-center font-poppins text-ink"
          style={{ fontSize: 40, lineHeight: 60 }}
          testID="availability-screen-date-text"
        >
          {formattedDate}
        </Text>
      </View>

      {isLoadingParticipants ? (
        <ActivityIndicator
          color={theme.colors.ink}
          testID="availability-screen-participants-loading"
        />
      ) : (
        <View className="mb-4 mt-4 gap-6">
          <Text
            className="px-10 text-center font-poppins-medium text-xl text-wine"
            testID="availability-screen-participants-heading"
          >
            {hasParticipants
              ? 'Participantes disponíveis'
              : 'Nenhum participante disponível por enquanto'}
          </Text>

          {hasParticipants ? <AvailableParticipants participants={participants} /> : null}
        </View>
      )}

      <AvailabilityCard
        onIntervalsChange={setIntervals}
        registeredIntervals={registeredIntervals}
        allDay={isAllDay || isAlreadyAllDay}
        onAllDayChange={setIsAllDay}
        allDayDisabled={isAlreadyAllDay}
      />

      <View className="pb-10 pt-2">
        <Button
          title="Confirmar"
          variant="tertiary"
          onPress={() => void handleConfirm()}
          disabled={!canConfirm}
          isLoading={isSubmitting}
          testID="availability-screen-confirm"
        />
      </View>
    </ScreenFrame>
  );
}
