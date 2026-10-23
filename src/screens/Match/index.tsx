import { DatePickerSheet } from '@/components/DatePickerSheet';
import { ParticipantAvatars } from '@/components/ParticipantAvatars';
import { API_BASE_URL } from '@/constants';
import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import type { ProposalDetailsResponse } from '@/server/events';
import { theme } from '@/theme';
import { isValidTime, maskTime, TIME_LENGTH } from '@/utils/time';
import { isValidApiDate } from '@/utils/date';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

interface MatchScreenProps {
  proposal: ProposalDetailsResponse;
  participants: { id: string; name: string; profilePic: string | null }[];
  currentUserId?: string;
  isSubmitting: boolean;
  onSchedule: (date: string, time: string) => Promise<void>;
}

export function MatchScreen({
  proposal,
  participants,
  currentUserId,
  isSubmitting,
  onSchedule,
}: MatchScreenProps) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const location = proposal.location;
  const imageUrl = location?.imageUrl ? `${API_BASE_URL}${location.imageUrl}` : null;
  const imageSource = useAuthenticatedImageSource(imageUrl);
  const isScheduleEnabled = isValidApiDate(date) && isValidTime(time) && !isSubmitting;

  // Configure post-match scheduling here; suggestions themselves intentionally store no date or time.

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-canvas"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="match-screen"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow gap-6 px-6 pb-8 pt-16"
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center gap-6">
          <View className="items-center gap-2">
            <Ionicons
              name="star"
              size={46}
              color={theme.colors.coral}
            />
            <Text className="text-center font-poppins-medium text-3xl text-ink">
              Vocês têm um match!
            </Text>
            <Text className="text-center font-poppins text-sm text-wine">
              Todo mundo concordou com este local.
            </Text>
          </View>

          <View className="w-full max-w-sm items-center gap-3 rounded-3xl bg-surface p-5">
            {imageSource ? (
              <Image
                source={imageSource}
                contentFit="cover"
                style={{ width: '100%', height: 176, borderRadius: 16 }}
                accessibilityLabel={`Foto de ${location?.name ?? proposal.name ?? 'local'}`}
              />
            ) : null}
            <Text className="text-center font-poppins-semibold text-xl text-wine">
              {proposal.name ?? location?.name ?? 'Local escolhido'}
            </Text>
            <Text className="text-center font-poppins text-sm text-ink-soft">
              {location?.address ?? location?.description ?? ''}
            </Text>
            <ParticipantAvatars
              participants={participants.map((participant) => ({
                ...participant,
                answer: 'yes' as const,
              }))}
              currentUserId={currentUserId}
              testID="match-participants"
            />
          </View>

          <View className="w-full max-w-sm gap-3">
            <Text className="font-poppins-semibold text-lg text-ink">Agende o encontro</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={date ? `Data do evento ${date}` : 'Escolher data do evento'}
              className="flex-row items-center gap-3 rounded-full bg-coral px-5 py-3"
              onPress={() => {
                setIsDatePickerVisible(true);
              }}
              testID="match-date-button"
            >
              <Ionicons
                name="calendar-outline"
                size={20}
                color={theme.colors.white}
              />
              <Text className="font-poppins-medium text-base text-white">
                {date ? date.split('-').reverse().join('/') : 'Escolher dia'}
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-2 rounded-full bg-coral px-4">
              <Ionicons
                name="time-outline"
                size={20}
                color={theme.colors.white}
              />
              <TextInput
                accessibilityLabel="Horário do evento"
                className="flex-1 py-3 font-poppins-medium text-lg text-white outline-none"
                keyboardType="number-pad"
                maxLength={TIME_LENGTH}
                onChangeText={(value) => {
                  setTime(maskTime(value));
                }}
                placeholder="Adicionar horário"
                placeholderTextColor={theme.colors.coralSoft}
                testID="match-time-input"
                value={time}
              />
            </View>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: !isScheduleEnabled, busy: isSubmitting }}
          className={`items-center justify-center rounded-full py-4 ${
            isScheduleEnabled ? 'bg-ink' : 'bg-ink-soft'
          }`}
          disabled={!isScheduleEnabled}
          onPress={() => {
            void onSchedule(date, time);
          }}
          testID="match-create-event"
        >
          {isSubmitting ? (
            <ActivityIndicator color={theme.colors.white} />
          ) : (
            <Text className="font-poppins-semibold text-base text-white">Criar evento</Text>
          )}
        </Pressable>
      </ScrollView>

      {isDatePickerVisible ? (
        <DatePickerSheet
          visible
          initialDate={date || undefined}
          onSelectDate={(selectedDate) => {
            setDate(selectedDate);
            setIsDatePickerVisible(false);
          }}
          onClose={() => {
            setIsDatePickerVisible(false);
          }}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}
