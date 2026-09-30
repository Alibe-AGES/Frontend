import { Button } from '@/components/Button';
import { useDefaultPhotoPickerController } from '@/components/PhotoPicker/controllers/useDefaultPhotoPickerController';
import { theme } from '@/theme';
import { DATE_LENGTH, maskDate } from '@/utils/date';
import { maskTime, TIME_LENGTH } from '@/utils/time';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FC } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
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

  const footer = (
    <Button
      title="Confirmar"
      variant="tertiary"
      disabled={isConfirmDisabled}
      isLoading={isSubmitting}
      onPress={onConfirm}
      testID={`${testID}-confirm`}
    />
  );

  return (
    <EventCardFrame
      image={image}
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
        icon="calendar-outline"
        value={draft.date}
        placeholder="Adicionar data"
        onChangeText={(date) => {
          updateDraft({ date: maskDate(date) });
        }}
        keyboardType="number-pad"
        maxLength={DATE_LENGTH}
        testID={`${testID}-date-input`}
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
