import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import tw from 'twrnc';

import { Dropdown } from '@/components/Dropdown';
import { useDefaultPhotoPickerController } from '@/components/PhotoPicker/controllers/useDefaultPhotoPickerController';
import type { UsePhotoPickerParams } from '@/components/PhotoPicker/PhotoPicker.types';
import { theme } from '@/theme';
import type { NewMemoryCardProps } from './NewMemoryCard.types';

export type { NewMemoryCardProps } from './NewMemoryCard.types';

const PHOTO_ASPECT: [number, number] = [4, 5];

// Crops to the card's portrait frame instead of the picker's default square.
function useMemoryPhotoController(params?: UsePhotoPickerParams) {
  return useDefaultPhotoPickerController({ ...params, aspect: PHOTO_ASPECT });
}

export function NewMemoryCard({
  events,
  selectedEventId,
  isLoadingEvents = false,
  onSelectEvent,
  emptyEventsMessage = 'Nenhum evento disponível',
  eventsHint,
  onPhotoSelected,
  onClose,
  usePhotoController = useMemoryPhotoController,
  testID = 'new-memory-card',
}: Readonly<NewMemoryCardProps>) {
  const { photoUri, isLoading, pickImage } = usePhotoController({
    onUploadSuccess: onPhotoSelected,
  });
  const [isHintVisible, setIsHintVisible] = useState(false);

  return (
    <View
      className="w-full overflow-hidden rounded-2xl bg-white shadow-md"
      testID={testID}
    >
      <View className="flex-row items-center px-3 py-3">
        <View className="w-5" />
        <Text className="flex-1 text-center font-poppins text-sm text-ink">
          Selecione o evento e a imagem
        </Text>
        {onClose ? (
          <Pressable
            accessibilityLabel="Fechar"
            accessibilityRole="button"
            className="w-5 items-end"
            hitSlop={12}
            onPress={onClose}
            style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
            testID={`${testID}-close`}
          >
            <Ionicons
              color={theme.colors.ink}
              name="close"
              size={20}
            />
          </Pressable>
        ) : (
          <View className="w-5" />
        )}
      </View>

      <Pressable
        accessibilityLabel={photoUri ? 'Trocar imagem do evento' : 'Adicionar imagem do evento'}
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading, busy: isLoading }}
        className="aspect-[4/5] w-full items-center justify-center bg-pink"
        disabled={isLoading}
        onPress={() => {
          void pickImage();
        }}
        style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
        testID={`${testID}-photo`}
      >
        {isLoading ? (
          <ActivityIndicator
            color={theme.colors.ink}
            testID={`${testID}-photo-loading`}
          />
        ) : null}
        {!isLoading && photoUri ? (
          <Image
            accessibilityLabel="Imagem do evento"
            accessible
            contentFit="cover"
            source={{ uri: photoUri }}
            style={tw`h-full w-full`}
            testID={`${testID}-photo-image`}
          />
        ) : null}
        {!isLoading && !photoUri ? (
          <View className="items-center gap-3">
            <View className="h-14 w-14 items-center justify-center rounded-full bg-ink">
              <View className="absolute h-1 w-6 rounded-full bg-pink" />
              <View className="absolute h-6 w-1 rounded-full bg-pink" />
            </View>
            <Text className="font-poppins text-sm text-ink underline">
              Adicione uma imagem do evento.
            </Text>
          </View>
        ) : null}
      </Pressable>

      <View className="py-1">
        <View className="flex-row items-center justify-center px-3">
          {/* Same width as the info button, so the dropdown stays centered on the card and its
              list, centered under the dropdown, lines up with the card too. */}
          {eventsHint ? <View className="w-5" /> : null}
          <View className="shrink">
            <Dropdown
              disabled={isLoadingEvents}
              emptyMessage={emptyEventsMessage}
              onChange={onSelectEvent}
              options={events}
              placeholder={isLoadingEvents ? 'Carregando eventos...' : 'Selecionar evento'}
              testID={`${testID}-event`}
              value={selectedEventId}
            />
          </View>
          {eventsHint ? (
            <Pressable
              accessibilityLabel="Sobre a lista de eventos"
              accessibilityRole="button"
              accessibilityState={{ expanded: isHintVisible }}
              className="w-5 items-start"
              hitSlop={12}
              onPress={() => {
                setIsHintVisible((visible) => !visible);
              }}
              style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
              testID={`${testID}-events-hint-toggle`}
            >
              <Ionicons
                color={theme.colors.wine}
                name="information-circle-outline"
                size={18}
              />
            </Pressable>
          ) : null}
        </View>
        {/* The hint sits below the dropdown, so a long explanation never squeezes the list. */}
        {eventsHint && isHintVisible ? (
          <View
            className="mx-4 mb-2 rounded-2xl bg-ink px-4 py-3"
            testID={`${testID}-events-hint`}
          >
            <Text className="font-poppins text-sm text-white">{eventsHint}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
