import { AvailabilityCard } from '@/components/AvailabilityCard';
import { AvailabilityInterval } from '@/components/AvailabilityCard/Availability.types';
import { Avatar } from '@/components/Avatar';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

export interface AvailabilityParticipant {
  readonly id: string;
  readonly name: string;
  readonly avatarUrl: string;
  readonly status: 'available' | 'no-response';
}

export interface AvailabilityScreenProps {
  readonly date?: string;
  readonly participants?: AvailabilityParticipant[];
  readonly onConfirm?: (intervals: AvailabilityInterval[]) => void | Promise<void>;
  readonly onDecline?: () => void | Promise<void>;
}

export function AvailabilityScreen({
  date,
  participants = [],
  onConfirm,
  onDecline,
}: AvailabilityScreenProps) {
  const [intervals, setIntervals] = useState<AvailabilityInterval[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
  const availableCount = participants.filter(
    (participant) => participant.status === 'available'
  ).length;

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      await onConfirm?.(intervals);
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

  const handleDecline = async () => {
    try {
      setIsSubmitting(true);
      await onDecline?.();
      Toast.show({
        type: 'success',
        text1: 'Sem resposta',
        text2: 'Você não enviou disponibilidade para este dia.',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível salvar. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: '#FFFBF6' }}
      contentContainerClassName="gap-6 px-6 py-16"
      testID="availability-screen"
    >
      <BackButton color={theme.colors.black} />

      <View className="flex-row items-center justify-center gap-10">
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

      <Text
        className="text-center font-poppins-medium text-xl"
        style={{ color: theme.colors.wine }}
        testID="availability-screen-participants-heading"
      >
        {hasParticipants
          ? `Status de disponibilidade (${String(availableCount)}/${String(participants.length)})`
          : 'Nenhum participante no grupo'}
      </Text>

      {hasParticipants ? (
        <View
          className="gap-3 px-1"
          testID="availability-screen-participants"
        >
          {participants.map((participant, index) => (
            <View
              key={`${participant.id}-${String(index)}`}
              className="flex-row items-center gap-3 rounded-2xl bg-surface p-3"
              testID={`availability-participant-${participant.id}`}
            >
              <Avatar
                photoUri={participant.avatarUrl}
                accessibilityLabel={participant.name}
                imageClassName="h-12 w-12 rounded-full border-2 border-canvas"
                iconSize={24}
              />
              <Text className="flex-1 font-poppins-medium text-sm text-ink">
                {participant.name}
              </Text>
              <Text
                className={`font-poppins-semibold text-xs ${
                  participant.status === 'available' ? 'text-ink' : 'text-inkSoft'
                }`}
                testID={`availability-status-${participant.id}`}
              >
                {participant.status === 'available' ? 'Disponível' : 'Sem resposta'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <AvailabilityCard onIntervalsChange={setIntervals} />

      <View className="gap-3 pt-2">
        <Button
          title="Confirmar!"
          variant="tertiary"
          onPress={() => void handleConfirm()}
          disabled={isSubmitting}
        />

        <Button
          title="Sair sem informar disponibilidade"
          variant="tertiary"
          onPress={() => void handleDecline()}
          disabled={isSubmitting}
        />
      </View>
    </ScrollView>
  );
}
