import type { AvailabilityInterval } from '@/components/AvailibilityCard/Availiability.types';
import { AvailabilityScreen } from '@/screens/AvailabilityScreen';
import { createAvailability } from '@/server/availabilities';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function AvailabilityRoute() {
  const router = useRouter();

  const { id: groupId, date } = useLocalSearchParams<{ id: string; date?: string }>();

  const targetDate = date ?? new Date().toISOString().split('T')[0];

  const handleConfirm = async (intervals: AvailabilityInterval[]) => {
    const formattedIntervals = intervals
      .filter((i) => i.startTime && i.endTime)
      .map((i) => ({
        startTime: i.startTime,
        endTime: i.endTime,
      }));

    await createAvailability(groupId, {
      date: targetDate,
      intervals: formattedIntervals,
    });
    router.back();
  };

  const handleDecline = () => {
    router.back();
  };

  return (
    <AvailabilityScreen
      date={targetDate}
      onConfirm={handleConfirm}
      onDecline={handleDecline}
    />
  );
}
