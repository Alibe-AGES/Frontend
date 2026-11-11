import { useLocalSearchParams, useRouter } from 'expo-router';

import { useGroupMemories } from '@/hooks/useGroupMemories';
import { flattenMemorySections } from '@/utils/memories';
import { MemoriesCarouselScreen } from '.';

export default function MemoriesCarouselController() {
  const router = useRouter();
  const {
    id: groupId,
    photoId,
    date,
    month,
    year,
  } = useLocalSearchParams<{
    id: string;
    photoId?: string;
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

  if (!groupId) {
    return null;
  }

  const memories = flattenMemorySections(sections);
  const initialIndex = Math.max(
    0,
    memories.findIndex((memory) => memory.id === photoId)
  );

  return (
    <MemoriesCarouselScreen
      groupId={groupId}
      memories={memories}
      initialIndex={initialIndex}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onAddMemory={() => {
        router.push({ pathname: '/group/[id]/memories/new', params: { id: groupId } });
      }}
      onRetry={() => {
        void reload();
      }}
    />
  );
}
