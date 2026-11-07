import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';
import { NavigationBar } from '@/components/NavigationBar';
import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';

export interface MemoryPhotoItem {
  id: string;
  imageUrl: string;
}

export interface MemoryEventSection {
  eventId: string;
  date: string;
  time?: string | null;
  eventName: string;
  photos: MemoryPhotoItem[];
}

export interface MemoriesGalleryScreenProps {
  groupId: string;
  sections: MemoryEventSection[];
  isLoading: boolean;
  errorMessage: string | null;
  onAddMemory: () => void;
  onRetry: () => void;
}

const COLUMNS_PER_ROW = 3;

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

export function formatMemoryDate(dateString: string): string {
  const parts = dateString.split('-').map(Number);
  const [year, month, day] = parts;

  if (!year || !month || !day || parts.length !== 3) {
    return dateString;
  }

  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return dateString;
  }

  return `${WEEKDAYS[parsed.getDay()]}, ${String(parsed.getDate())} de ${MONTHS[parsed.getMonth()]}`;
}

function chunkPhotos(photos: MemoryPhotoItem[], size: number): MemoryPhotoItem[][] {
  const rows: MemoryPhotoItem[][] = [];

  for (let index = 0; index < photos.length; index += size) {
    rows.push(photos.slice(index, index + size));
  }

  return rows;
}

interface MemoryPhotoCardProps {
  photo: MemoryPhotoItem;
  eventName: string;
}

function MemoryPhotoCard({ photo, eventName }: Readonly<MemoryPhotoCardProps>) {
  const imageSource = useAuthenticatedImageSource(photo.imageUrl);

  return (
    <View
      className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-lime-soft shadow-sm"
      testID={`memories-gallery-photo-${photo.id}`}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          accessible
          accessibilityLabel={`Foto de ${eventName}`}
          contentFit="cover"
          style={tw`h-full w-full`}
          testID={`memories-gallery-photo-image-${photo.id}`}
        />
      ) : null}
    </View>
  );
}

export function MemoriesGalleryScreen({
  groupId,
  sections,
  isLoading,
  errorMessage,
  onAddMemory,
  onRetry,
}: Readonly<MemoriesGalleryScreenProps>) {
  const isEmpty = !isLoading && !errorMessage && sections.length === 0;

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow gap-6 px-6 pb-32 pt-16"
        testID="memories-gallery-screen"
      >
        <View className="flex-row items-center justify-between">
          <BackButton
            fallbackHref={
              groupId ? { pathname: '/group/[id]/memories', params: { id: groupId } } : '/groups'
            }
            accessibilityLabel="Voltar para memórias"
          />

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Adicionar memória"
            hitSlop={12}
            onPress={onAddMemory}
            className="h-7 w-7 items-center justify-center rounded-full bg-ink"
            style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
            testID="memories-gallery-add"
          >
            <Ionicons
              name="add"
              size={18}
              color={theme.colors.white}
            />
          </Pressable>
        </View>

        <Text className="text-center font-poppins-medium text-3xl text-wine">Suas memórias</Text>

        {isLoading ? (
          <View
            className="items-center gap-3 py-10"
            testID="memories-gallery-loading"
          >
            <ActivityIndicator color={theme.colors.ink} />
            <Text className="font-poppins text-sm text-ink">Carregando memórias…</Text>
          </View>
        ) : null}

        {errorMessage ? (
          <View
            className="items-center gap-4 py-10"
            testID="memories-gallery-error"
          >
            <Text className="text-center font-poppins text-base text-wine">{errorMessage}</Text>
            <Button
              title="Tentar de novo"
              variant="secondary"
              onPress={onRetry}
              testID="memories-gallery-retry"
            />
          </View>
        ) : null}

        {isEmpty ? (
          <View
            className="flex-1 items-center justify-center py-10"
            testID="memories-gallery-empty"
          >
            <Text className="px-6 text-center font-poppins text-base text-wine">
              Nenhuma memória encontrada para este período.
            </Text>
          </View>
        ) : null}

        {!isLoading && !errorMessage && sections.length > 0 ? (
          <View
            className="gap-8"
            testID="memories-gallery-list"
          >
            {sections.map((section) => {
              const rows = chunkPhotos(section.photos, COLUMNS_PER_ROW);

              return (
                <View
                  key={section.eventId}
                  className="gap-3"
                  testID={`memories-gallery-event-${section.eventId}`}
                >
                  <View className="gap-0.5">
                    <Text
                      className="font-poppins-light text-xs text-wine"
                      testID={`memories-gallery-event-${section.eventId}-date`}
                    >
                      {formatMemoryDate(section.date)}
                    </Text>
                    <Text
                      className="font-poppins-semibold text-base text-wine"
                      numberOfLines={2}
                      testID={`memories-gallery-event-${section.eventId}-name`}
                    >
                      {section.eventName}
                    </Text>
                  </View>

                  <View className="gap-3">
                    {rows.map((row, rowIndex) => {
                      const spacerCount = COLUMNS_PER_ROW - row.length;

                      return (
                        <View
                          key={`${section.eventId}-row-${String(rowIndex)}`}
                          className="flex-row gap-3"
                        >
                          {row.map((photo) => (
                            <View
                              key={photo.id}
                              className="flex-1"
                            >
                              <MemoryPhotoCard
                                photo={photo}
                                eventName={section.eventName}
                              />
                            </View>
                          ))}
                          {Array.from({ length: spacerCount }, (_, spacerIndex) => (
                            <View
                              key={`${section.eventId}-spacer-${String(rowIndex)}-${String(spacerIndex)}`}
                              className="flex-1"
                            />
                          ))}
                        </View>
                      );
                    })}
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}
      </ScrollView>

      {groupId ? (
        <View className="absolute inset-x-0 bottom-0">
          <NavigationBar groupId={groupId} />
        </View>
      ) : null}
    </View>
  );
}
