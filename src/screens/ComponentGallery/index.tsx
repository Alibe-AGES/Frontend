import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { Calendar } from '@/components/Calendar';
import { DayMark } from '@/components/Calendar/Calendar.types';
import { EventCard } from '@/components/EventCard';

const dayMarks: Record<string, DayMark> = {
  '2025-05-01': { status: 'available' },
  '2025-05-02': { status: 'available' },
  '2025-05-03': { status: 'available' },
  '2025-05-04': { status: 'available' },
  '2025-05-05': { status: 'available' },
  '2025-05-06': { status: 'available' },
  '2025-05-07': { status: 'available' },
  '2025-05-08': { status: 'realized' },
  '2025-05-09': { status: 'available' },
  '2025-05-10': { status: 'available' },
  '2025-05-11': { status: 'realized' },
  '2025-05-12': { status: 'realized' },
  '2025-05-13': { status: 'available' },
  '2025-05-14': { status: 'available' },
  '2025-05-15': { status: 'available' },
  '2025-05-16': { status: 'available' },
  '2025-05-17': { status: 'available' },
  '2025-05-18': { status: 'allAvailable' },
  '2025-05-19': { status: 'available', dot: 'pink' },
  '2025-05-20': { status: 'available' },
  '2025-05-21': { status: 'available' },
  '2025-05-22': { status: 'suggested' },
  '2025-05-23': { status: 'available' },
  '2025-05-24': { status: 'available' },
  '2025-05-25': { status: 'available' },
  '2025-05-26': { status: 'available' },
  '2025-05-27': { status: 'available', dot: 'coral' },
  '2025-05-28': { status: 'available' },
  '2025-05-29': { status: 'available' },
  '2025-05-30': { status: 'allAvailable' },
  '2025-05-31': { status: 'allAvailable' },
};

export function ComponentGalleryScreen() {
  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-6 px-6 py-16"
    >
      <View className="gap-2">
        <Text className="text-4xl font-black text-ink">Component gallery</Text>

        <Text className="text-inkSoft text-base font-medium">
          A quick visual check for reusable components.
        </Text>
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">Button</Text>

        <Button title="Primary button" />

        <Button
          title="Secondary button"
          variant="secondary"
        />

        <Button
          title="Disabled button"
          disabled
        />
      </View>

      <View className="rounded-3xl bg-surface p-4">
        <Calendar
          initialDate="2025-05-01"
          dayMarks={dayMarks}
          showLegend
        />
      </View>


      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">EventCard</Text>
        <EventCard
          event={{
            id: 'gallery-event',
            name: 'Bloom Café',
            timeslot: '2026-05-18T13:00:00.000Z',
            budgetStart: '20',
            budgetEnd: '100',
            location: { address: 'Av. Carlos Gomes, 600' },
            phone: '(00) 00000-0000',
            openingHours: ['Segunda à sábado: 9:00 - 18:00', 'Domingo: Fechado'],
            website: 'www.BloomCafé.com',
          }}
          onEditPress={() => undefined}
        />
        <EventCard event={{ id: 'gallery-event-minimal', name: 'Evento sem foto' }} />
      </View>
    </ScrollView>
  );
}
