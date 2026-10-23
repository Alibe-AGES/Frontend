import { useLocalSearchParams } from 'expo-router';

import { ExperienceDetailsScreen } from '.';

export default function ExperienceDetailsController() {
  const { id: groupId, placeId } = useLocalSearchParams<{ id: string; placeId: string }>();

  return (
    <ExperienceDetailsScreen
      groupId={groupId}
      placeId={placeId}
    />
  );
}
