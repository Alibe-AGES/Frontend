import { AvailabilityCard } from '@/components/AvailibilityCard';
import { AvailabilityInterval } from '@/components/AvailibilityCard/Availiability.types';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

export interface AvailabilityParticipant {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface AvailabilityScreenProps {
  date?: string;
  participants?: AvailabilityParticipant[];
  onConfirm?: (intervals: AvailabilityInterval[]) => void | Promise<void>;
  onDecline?: () => void | Promise<void>;
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

  const label = 'Nenhum participante \ndisponível por enquanto';
  const hasParticipants = participants.length > 0;

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
        text1: 'Sucesso!',
        text2: 'Marcado como indisponível.',
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
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-6 px-6 py-16"
      testID="availability-screen"
    >
      <BackButton color={theme.colors.black} />

      <View className="flex-row items-center justify-center gap-4">
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: theme.colors.pink }}
        >
          <Ionicons
            name="calendar-outline"
            size={24}
            color={theme.colors.ink}
          />
        </View>
        <Text className="items-center justify-items-center font-poppins text-3xl text-ink">
          {formattedDate}
        </Text>
      </View>

      <Text
        className="text-center font-poppins-medium text-lg"
        style={{ color: theme.colors.wine }}
        testID="availability-screen-participants-heading"
      >
        {hasParticipants ? 'Participantes disponíveis' : label}
      </Text>

      {hasParticipants ? (
        <View
          className="flex-row self-center"
          testID="availability-screen-participants"
        >
          {participants.map((participant, index) => (
            <Image
              key={participant.id}
              source={{ uri: participant.avatarUrl }}
              accessibilityLabel={participant.name}
              contentFit="cover"
              className="h-10 w-10 rounded-full border-2 border-canvas"
              style={index === 0 ? undefined : { marginLeft: -12 }}
            />
          ))}
        </View>
      ) : null}

      <AvailabilityCard onIntervalsChange={setIntervals} />
      {isSubmitting && (
        <Text className="text-inkSoft font-poppins-regular text-center text-base">Salvando...</Text>
      )}
      <View className="gap-3 pt-2">
        <Button
          title="Confirmar!"
          variant="primary"
          color={theme.colors.ink}
          onPress={() => void handleConfirm()}
        />

        <Button
          title="Não estarei disponível neste dia."
          variant="primary"
          color={theme.colors.ink}
          onPress={() => void handleDecline()}
        />
      </View>
    </ScrollView>
  );
}
