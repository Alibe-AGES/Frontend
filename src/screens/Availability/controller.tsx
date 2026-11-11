import type { AvailabilityInterval } from '@/components/AvailabilityCard/Availability.types';
import { AvailabilityScreen } from '@/screens/Availability';
import type { AvailabilityParticipant } from '@/screens/Availability/AvailableParticipants';
import { createAvailability, getAvailabilitiesByDate } from '@/server/availabilities';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

export default function AvailabilityController() {
  const router = useRouter();

  const { id: groupId, date } = useLocalSearchParams<{ id: string; date?: string }>();

  const now = new Date();
  const localDate = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const targetDate = date ?? localDate;

  const [participants, setParticipants] = useState<AvailabilityParticipant[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function fetchParticipants() {
      setIsLoadingParticipants(true);

      try {
        const { users } = await getAvailabilitiesByDate(groupId, targetDate);

        if (isActive) {
          setParticipants(
            // Someone without a full day or any interval has not actually registered availability.
            users
              .filter((user) => user.availableAllDay || user.intervals.length > 0)
              .map((user) => ({
                id: user.id,
                name: user.name,
                photoUri: user.image,
                isCurrentUser: user.isCurrentUser,
                availableAllDay: user.availableAllDay,
                intervals: user.intervals,
              }))
          );
        }
      } catch (error) {
        console.error('Erro ao buscar participantes disponíveis', error);
      } finally {
        if (isActive) {
          setIsLoadingParticipants(false);
        }
      }
    }

    void fetchParticipants();

    return () => {
      isActive = false;
    };
  }, [groupId, targetDate]);

  const handleConfirm = async (intervals: AvailabilityInterval[]) => {
    if (!groupId) {
      return;
    }

    const formattedIntervals = intervals
      .filter((i) => i.startTime && i.endTime)
      .map((i) => ({
        startTime: i.startTime,
        endTime: i.endTime,
      }));

    const payload = {
      date: targetDate,
      intervals: formattedIntervals,
    };

    console.log('[Availability] POST payload:', JSON.stringify(payload));

    await createAvailability(groupId, payload);

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/group/${groupId}`);
    }
  };

  return (
    <AvailabilityScreen
      date={targetDate}
      participants={participants}
      isLoadingParticipants={isLoadingParticipants}
      onConfirm={handleConfirm}
    />
  );
}
