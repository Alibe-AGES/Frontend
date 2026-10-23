import { useDefaultPhotoPickerController } from '@/components/PhotoPicker/controllers/useDefaultPhotoPickerController';
import { theme } from '@/theme';
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
  variant = 'event',
  draft,
  onChangeDraft,
  onDatePress,
  onImageSelected,
  onConfirm,
  isConfirmDisabled = false,
  isSubmitting = false,
  testID,
}) => {
  const isSuggestion = variant === 'suggestion';

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
          {isSuggestion
            ? 'Adicione uma imagem que representa sua sugestão'
            : 'Adicione uma imagem que representa seu evento'}
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

  const header = isSuggestion ? null : (
    <View className="flex-row items-center justify-center gap-4">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-pink">
        <Ionicons
          name="calendar-outline"
          size={28}
          color={theme.colors.ink}
        />
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={draft.date ? `Data do evento ${draft.date}` : 'Escolher data do evento'}
        className="min-w-28 items-center"
        onPress={onDatePress}
        testID={`${testID}-date-button`}
      >
        <Text className="text-center font-poppins text-3xl text-ink">
          {draft.date ? `${draft.date.slice(8, 10)}/${draft.date.slice(5, 7)}` : 'Escolher dia'}
        </Text>
      </Pressable>
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
        accessibilityLabel={isSuggestion ? 'Nome da sugestão' : 'Nome do evento'}
        className="py-1 text-center font-poppins-medium text-3xl text-wine outline-none"
        onChangeText={(name) => {
          updateDraft({ name });
        }}
        placeholder={isSuggestion ? 'Definir nome da sugestão' : 'Definir nome do evento'}
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

      {isSuggestion ? (
        <>
          <View className="flex-row gap-3">
            <View className="flex-1">
              <PillInput
                icon="cash-outline"
                value={draft.priceStart ?? ''}
                placeholder="Preço mínimo (R$)"
                onChangeText={(priceStart) => {
                  updateDraft({ priceStart });
                }}
                keyboardType="decimal-pad"
                testID={`${testID}-price-start-input`}
              />
            </View>
            <View className="flex-1">
              <PillInput
                icon="cash-outline"
                value={draft.priceEnd ?? ''}
                placeholder="Preço máximo (R$)"
                onChangeText={(priceEnd) => {
                  updateDraft({ priceEnd });
                }}
                keyboardType="decimal-pad"
                testID={`${testID}-price-end-input`}
              />
            </View>
          </View>
          <PillInput
            icon="call-outline"
            value={draft.phoneNumber ?? ''}
            placeholder="Telefone"
            onChangeText={(phoneNumber) => {
              updateDraft({ phoneNumber });
            }}
            keyboardType="phone-pad"
            testID={`${testID}-phone-input`}
          />
          <PillInput
            icon="time-outline"
            value={draft.openingHours ?? ''}
            placeholder="Horários de funcionamento"
            onChangeText={(openingHours) => {
              updateDraft({ openingHours });
            }}
            multiline
            testID={`${testID}-opening-hours-input`}
          />
          <PillInput
            icon="globe-outline"
            value={draft.website ?? ''}
            placeholder="Site"
            onChangeText={(website) => {
              updateDraft({ website });
            }}
            keyboardType="url"
            testID={`${testID}-website-input`}
          />
        </>
      ) : (
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
      )}
    </EventCardFrame>
  );
};
