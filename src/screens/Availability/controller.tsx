import type { AvailabilityInterval } from '@/components/AvailabilityCard/Availability.types';
import { AvailabilityScreen, type AvailabilityParticipant } from '@/screens/Availability';
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

  useEffect(() => {
    async function fetchParticipants() {
      try {
        const data = await getAvailabilitiesByDate(groupId, targetDate);

        const mapped = data.map((item) => ({
          id: item.id,
          name: item.name,
          avatarUrl:
            item.profilePic ??
            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`,
        }));

        setParticipants(mapped);
      } catch (error) {
        console.error('Erro ao buscar participantes disponíveis', error);
      }
    }

    void fetchParticipants();
  }, [groupId, targetDate]);

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

    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace(`/group/${groupId}`);
    }
  };

  const handleDecline = () => {
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
      onConfirm={handleConfirm}
      onDecline={handleDecline}
    />
  );
}
