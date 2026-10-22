import { useLocalSearchParams } from 'expo-router';

import { ExperienceDetailsScreen } from '.';

export default function ExperienceDetailsController() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();

  return <ExperienceDetailsScreen placeId={placeId} />;
}
