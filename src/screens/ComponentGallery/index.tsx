import { Button } from '@/components/Button';
import { EventCard, type EventCardEvent } from '@/components/EventCard';
import { MemoryCard } from '@/components/MemoryCard';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

const completeEvent: EventCardEvent = {
  id: 'gallery-event-complete',
  name: 'Bloom Café',
  timeslot: new Date(2026, 4, 18, 10, 0),
  location: { address: 'Av. Carlos Gomes, 600' },
  imageUrl: 'https://picsum.photos/seed/cafe/600/400',
  budgetStart: 20,
  budgetEnd: 100,
  phone: '(51) 99999-0000',
  openingHours: ['Segunda a sábado: 9:00 - 18:00', 'Domingo: Fechado'],
  website: 'www.bloomcafe.com',
};

const partialEvent: EventCardEvent = {
  id: 'gallery-event-partial',
  name: 'Passeio no parque',
  timeslot: new Date(2026, 4, 18, 14, 30),
  location: { address: 'Parque Farroupilha' },
};

export function ComponentGalleryScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-6 px-6 py-16"
    >
      <View className="items-center">
        <Button title="Simple button" />
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">Galeria de Memórias (ALI-123)</Text>
        <Text className="text-sm text-ink-soft">
          Atalhos para testar a tela de galeria no emulador/celular:
        </Text>
        <Button
          title="Abrir Galeria (Setembro 2026)"
          onPress={() => {
            router.push({
              pathname: '/group/[id]/memories/gallery',
              params: {
                id: '7cd60fad-d815-41b3-b3bc-567aa63eb666',
                month: '9',
                year: '2026',
              },
            });
          }}
        />
        <Button
          title="Abrir Galeria no dia 05/09/2026"
          variant="secondary"
          onPress={() => {
            router.push({
              pathname: '/group/[id]/memories/gallery',
              params: {
                id: '7cd60fad-d815-41b3-b3bc-567aa63eb666',
                date: '2026-09-05',
              },
            });
          }}
        />
      </View>

      <View className="items-center">
        <MemoryCard
          date={new Date()}
          name="Sample Memory"
          address="123 Main St, City, State 12345"
          imageUri="https://picsum.photos/600/800"
        />
      </View>

      <View className="gap-6 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">EventCard — dia do calendário</Text>
        <View className="gap-3">
          <Text className="text-base font-medium text-ink">Informações completas</Text>
          <EventCard
            event={completeEvent}
            testID="gallery-event-card-complete"
          />
        </View>
        <View className="gap-3">
          <Text className="text-base font-medium text-ink">Informações parciais</Text>
          <EventCard
            event={partialEvent}
            testID="gallery-event-card-partial"
          />
        </View>
      </View>
    </ScrollView>
  );
}
