import { useDefaultPhotoPickerController } from '@/components/PhotoPicker/controllers/useDefaultPhotoPickerController';
import { theme } from '@/theme';
import { DAY_MONTH_LENGTH, maskDayMonth } from '@/utils/date';
import { maskTime, TIME_LENGTH } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FC } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import tw from 'twrnc';
import { EventCardCreateProps, EventCardDraft } from './EventCard.types';
import { EventCardFrame } from './EventCardFrame';
import { PillInput } from './Pill';

export const EventCardForm: FC<Omit<EventCardCreateProps, 'mode'> & { testID: string }> = ({
  draft,
  onChangeDraft,
  onImageSelected,
  onConfirm,
  isConfirmDisabled = false,
  isSubmitting = false,
  testID,
}) => {
  const updateDraft = (changes: Partial<EventCardDraft>) => {
    onChangeDraft({ ...draft, ...changes });
  };

  const { pickImage } = useDefaultPhotoPickerController({
    aspect: [16, 10],
    onUploadSuccess: (photo) => {
      updateDraft({ imageUri: photo.uri });
      onImageSelected?.(photo);
    },
  });

  const renderImageContent = () => {
    if (draft.imageUri) {
      return (
        <Image
          source={{ uri: draft.imageUri }}
          contentFit="cover"
          style={tw`h-full w-full`}
          testID={`${testID}-image`}
        />
      );
    }
    return (
      <View
        className="h-full w-full items-center justify-center gap-3 bg-coral px-8"
        testID={`${testID}-image-placeholder`}
      >
        <View className="h-9 w-9 items-center justify-center rounded-full bg-white">
          <Ionicons
            name="add"
            size={22}
            color={theme.colors.coral}
          />
        </View>
        <Text className="text-center font-poppins text-sm text-white">
          Adicione uma imagem que representa seu evento
        </Text>
      </View>
    );
  };

  const image = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={draft.imageUri ? 'Trocar imagem do evento' : 'Adicionar imagem do evento'}
      onPress={() => {
        void pickImage();
      }}
      style={({ pressed }) => tw`h-full w-full ${pressed ? 'opacity-75' : 'opacity-100'}`}
      testID={`${testID}-image-picker`}
    >
      {renderImageContent()}
    </Pressable>
  );

  const header = (
    <View className="flex-row items-center justify-center gap-4">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-pink">
        <Ionicons
          name="calendar-outline"
          size={28}
          color={theme.colors.ink}
        />
      </View>
      <TextInput
        accessibilityLabel="Data do evento"
        className="w-28 text-center font-poppins text-4xl text-ink outline-none"
        keyboardType="number-pad"
        maxLength={DAY_MONTH_LENGTH}
        onChangeText={(date) => {
          updateDraft({ date: maskDayMonth(date) });
        }}
        placeholder="00/00"
        placeholderTextColor={theme.colors.inkSoft}
        testID={`${testID}-date-input`}
        value={draft.date}
      />
    </View>
  );

  const isConfirmBlocked = isConfirmDisabled || isSubmitting;
  const footer = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Confirmar"
      accessibilityState={{ disabled: isConfirmBlocked, busy: isSubmitting }}
      className={`items-center justify-center rounded-full px-6 py-3 ${
        isConfirmBlocked ? 'bg-ink-soft' : 'bg-ink active:bg-ink-soft'
      }`}
      disabled={isConfirmBlocked}
      onPress={onConfirm}
      testID={`${testID}-confirm`}
    >
      {isSubmitting ? (
        <ActivityIndicator
          color={theme.colors.white}
          testID={`${testID}-confirm-loading`}
        />
      ) : (
        <Text className="font-poppins text-lg text-white">Confirmar</Text>
      )}
    </Pressable>
  );

  return (
    <EventCardFrame
      image={image}
      header={header}
      footer={footer}
      testID={testID}
    >
      <TextInput
        accessibilityLabel="Nome do evento"
        className="py-1 text-center font-poppins-medium text-3xl text-wine outline-none"
        onChangeText={(name) => {
          updateDraft({ name });
        }}
        placeholder="Definir nome do evento"
        placeholderTextColor={theme.colors.wineSoft}
        testID={`${testID}-name-input`}
        value={draft.name}
      />

      <PillInput
        icon="location-outline"
        value={draft.address}
        placeholder="Adicionar endereço"
        onChangeText={(address) => {
          updateDraft({ address });
        }}
        testID={`${testID}-address-input`}
      />

      <PillInput
        icon="time-outline"
        value={draft.time}
        placeholder="Adicionar horário"
        onChangeText={(time) => {
          updateDraft({ time: maskTime(time) });
        }}
        keyboardType="number-pad"
        maxLength={TIME_LENGTH}
        testID={`${testID}-time-input`}
      />
    </EventCardFrame>
  );
};
