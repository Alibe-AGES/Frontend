import { ScrollView, Text, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import type { DropdownOption } from '@/components/Dropdown';
import { NewMemoryCard } from '@/components/NewMemoryCard';
import type { SelectedPhoto, UsePhotoPickerHook } from '@/components/PhotoPicker/PhotoPicker.types';
import { theme } from '@/theme';

export interface NewMemoryScreenProps {
  groupId?: string;
  events: DropdownOption[];
  selectedEventId: string | null;
  hasPhoto: boolean;
  isLoadingEvents: boolean;
  isSubmitting: boolean;
  error: string | null;
  onSelectEvent: (eventId: string) => void;
  onPhotoSelected: (photo: SelectedPhoto) => void;
  onClose: () => void;
  onCreate: () => void;
  // Swaps how the photo is picked; the card defaults to the device gallery.
  usePhotoController?: UsePhotoPickerHook;
}

export function NewMemoryScreen({
  groupId,
  events,
  selectedEventId,
  hasPhoto,
  isLoadingEvents,
  isSubmitting,
  error,
  onSelectEvent,
  onPhotoSelected,
  onClose,
  onCreate,
  usePhotoController,
}: Readonly<NewMemoryScreenProps>) {
  const isCreateDisabled = !selectedEventId || !hasPhoto || isLoadingEvents;

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView contentContainerClassName="grow px-8 pb-10 pt-12">
        <BackButton
          accessibilityLabel="Voltar para as memórias"
          className="mb-6"
          fallbackHref={groupId ? `/group/${groupId}/memories` : '/groups'}
        />

        <Text className={`mb-8 text-center text-4xl text-wine ${theme.typography.display}`}>
          Nova memória
        </Text>

        {error ? (
          <Text
            accessibilityRole="alert"
            className="mb-4 text-center font-poppins text-sm text-wine"
          >
            {error}
          </Text>
        ) : null}

        <NewMemoryCard
          events={events}
          onClose={onClose}
          onPhotoSelected={onPhotoSelected}
          onSelectEvent={onSelectEvent}
          selectedEventId={selectedEventId}
          testID="new-memory-card"
          usePhotoController={usePhotoController}
        />

        <View className="mt-3">
          <Button
            disabled={isCreateDisabled}
            isLoading={isSubmitting}
            onPress={onCreate}
            testID="new-memory-submit"
            title="Criar memória"
          />
        </View>
      </ScrollView>
    </View>
  );
}
