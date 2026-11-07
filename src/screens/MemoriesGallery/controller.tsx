import { useLocalSearchParams, useRouter } from 'expo-router';

import { useGroupMemories } from '@/hooks/useGroupMemories';
import { MemoriesGalleryScreen } from '@/screens/MemoriesGallery';

export { resolveMemoryImageUrl, sortMemorySections } from '@/hooks/useGroupMemories';

export default function MemoriesGalleryController() {
  const router = useRouter();
  const {
    id: groupId,
    date,
    month,
    year,
  } = useLocalSearchParams<{
    id: string;
    date?: string;
    month?: string;
    year?: string;
  }>();

  const { sections, isLoading, errorMessage, reload } = useGroupMemories({
    groupId,
    date,
    month,
    year,
  });

  const handleAddMemory = () => {
    if (!groupId) {
      return;
    }

    router.push({ pathname: '/group/[id]/memories/new', params: { id: groupId } });
  };

  const handlePhotoPress = (photoId: string) => {
    if (!groupId) {
      return;
    }

    router.push({
      pathname: '/group/[id]/memories/carousel',
      params: {
        id: groupId,
        photoId,
        ...(date ? { date } : {}),
        ...(month ? { month } : {}),
        ...(year ? { year } : {}),
      },
    });
  };

  if (!groupId) {
    return null;
  }

  return (
    <MemoriesGalleryScreen
      groupId={groupId}
      sections={sections}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onAddMemory={handleAddMemory}
      onPhotoPress={handlePhotoPress}
      onRetry={() => {
        void reload();
      }}
    />
  );
}
