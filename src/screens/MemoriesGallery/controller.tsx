import { useLocalSearchParams, useRouter } from 'expo-router';

import { resolveMemoryCalendarPeriod, useGroupMemories } from '@/hooks/useGroupMemories';
import { MemoriesGalleryScreen } from '@/screens/MemoriesGallery';

export { resolveMemoryImageUrl, sortMemorySections } from '@/hooks/useGroupMemories';

export default function MemoriesGalleryController() {
  const router = useRouter();
  const {
    id: groupId,
    date,
    month: monthParam,
    year: yearParam,
  } = useLocalSearchParams<{
    id: string;
    date?: string;
    month?: string;
    year?: string;
  }>();

  const { sections, isLoading, errorMessage, reload } = useGroupMemories({
    groupId,
    date,
    month: monthParam,
    year: yearParam,
  });

  const handleAddMemory = () => {
    if (!groupId) {
      return;
    }

    const { month, year } = resolveMemoryCalendarPeriod(date, monthParam, yearParam);

    router.push({
      pathname: '/group/[id]/memories/new',
      params: {
        id: groupId,
        month: String(month),
        year: String(year),
        ...(date ? { date } : {}),
      },
    });
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
        ...(monthParam ? { month: monthParam } : {}),
        ...(yearParam ? { year: yearParam } : {}),
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
