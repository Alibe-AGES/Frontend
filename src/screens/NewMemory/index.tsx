import { Text, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import type { DropdownOption } from '@/components/Dropdown';
import { NavigationBar } from '@/components/NavigationBar';
import { NewMemoryCard } from '@/components/NewMemoryCard';
import type { SelectedPhoto, UsePhotoPickerHook } from '@/components/PhotoPicker/PhotoPicker.types';
import { ScreenFrame } from '@/components/ScreenFrame';

export interface NewMemoryScreenProps {
  groupId: string;
  events: DropdownOption[];
  selectedEventId: string | null;
  hasPhoto: boolean;
  isLoadingEvents: boolean;
  isSubmitting: boolean;
  error: string | null;
  onRetry: () => void;
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
  onRetry,
  onSelectEvent,
  onPhotoSelected,
  onClose,
  onCreate,
  usePhotoController,
}: Readonly<NewMemoryScreenProps>) {
  const isCreateDisabled = !selectedEventId || !hasPhoto || isLoadingEvents;

  return (
    <ScreenFrame
      footer={<NavigationBar groupId={groupId} />}
      gap="md"
      header={
        <BackButton
          accessibilityLabel="Voltar para as memórias"
          fallbackHref={{ pathname: '/group/[id]/memories', params: { id: groupId } }}
        />
      }
      testID="new-memory-screen"
    >
      <Text className="mb-6 text-center font-poppins text-4xl text-wine">Nova memória</Text>

      {error ? (
        <View className="items-center gap-3">
          <Text
            accessibilityRole="alert"
            className="text-center font-poppins text-sm text-wine"
          >
            {error}
          </Text>
          <Button
            onPress={onRetry}
            testID="new-memory-retry"
            title="Tentar novamente"
            variant="secondary"
          />
        </View>
      ) : null}

      <View className="gap-4 px-6">
        <NewMemoryCard
          events={events}
          isLoadingEvents={isLoadingEvents}
          onClose={onClose}
          onPhotoSelected={onPhotoSelected}
          onSelectEvent={onSelectEvent}
          selectedEventId={selectedEventId}
          testID="new-memory-card"
          usePhotoController={usePhotoController}
        />

        <Button
          disabled={isCreateDisabled}
          isLoading={isSubmitting}
          onPress={onCreate}
          testID="new-memory-submit"
          title="Criar memória"
        />
      </View>
    </ScreenFrame>
  );
}
