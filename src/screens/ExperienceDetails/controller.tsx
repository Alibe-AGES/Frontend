import { useLocalSearchParams } from 'expo-router';

import { ExperienceDetailsScreen } from '.';

export default function ExperienceDetailsController() {
  const {
    id: groupId,
    placeId,
    isStoredLocation,
  } = useLocalSearchParams<{
    id: string;
    placeId: string;
    isStoredLocation?: string;
  }>();

  return (
    <ExperienceDetailsScreen
      groupId={groupId}
      placeId={placeId}
      isStoredLocation={isStoredLocation === 'true'}
    />
  );
}
