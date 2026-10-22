import { Button } from '@/components/Button';
import { Calendar } from '@/components/Calendar';
import { DayMark } from '@/components/Calendar/Calendar.types';
import { DatePickerSheet } from '@/components/DatePickerSheet';
import { EventCard, EventCardDraft } from '@/components/EventCard';
import { FilterCarousel } from '@/components/FilterCarousel';
import { EMPTY_FILTER_VALUE, FilterGroup, FilterSheet } from '@/components/FilterSheet';
import { PlaceCard } from '@/components/PlaceCard';
import { PlaceList } from '@/components/PlaceList';
import { ProfileCard } from '@/components/ProfileCard';
import { SearchBar } from '@/components/SearchBar';
import { usePlaces } from '@/hooks/usePlaces';
import { isValidApiDate } from '@/utils/date';
import { isValidTime } from '@/utils/time';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

const filterTags = [
  { id: 'recommended', label: 'Recomendados' },
  { id: 'restaurant', label: 'Restaurantes' },
  { id: 'class', label: 'Aulas' },
  { id: 'bar', label: 'Bares' },
  { id: 'outdoor', label: 'Ao ar livre' },
];

const filterGroups: FilterGroup[] = [
  {
    key: 'distance',
    title: 'Distância',
    options: [
      { value: '5', label: 'Até 5 km' },
      { value: '10', label: 'Até 10 km' },
      { value: 'any', label: 'Qualquer distância' },
    ],
  },
  {
    key: 'period',
    title: 'Horário',
    multiple: true,
    options: [
      { value: 'morning', label: 'Manhã' },
      { value: 'afternoon', label: 'Tarde' },
      { value: 'night', label: 'Noite' },
    ],
  },
  {
    key: 'environment',
    title: 'Ambiente',
    multiple: true,
    options: [
      { value: 'outdoor', label: 'Ao ar livre' },
      { value: 'indoor', label: 'Ambiente fechado' },
    ],
  },
  {
    key: 'idealFor',
    title: 'Ideal para',
    multiple: true,
    options: [
      { value: 'pair', label: 'Dupla' },
      { value: 'small', label: 'Grupo pequeno' },
      { value: 'large', label: 'Grupo grande' },
    ],
  },
];

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
  const [eventDraft, setEventDraft] = useState<EventCardDraft>({
    name: '',
    imageUri: null,
    address: '',
    date: '',
    time: '',
  });
  const [isSubmittingEvent, setIsSubmittingEvent] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [filters, setFilters] = useState(EMPTY_FILTER_VALUE);
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const { places, isLoading, error, refetch } = usePlaces();
  const isEventDraftValid =
    eventDraft.name.trim() !== '' &&
    eventDraft.address.trim() !== '' &&
    isValidApiDate(eventDraft.date) &&
    isValidTime(eventDraft.time);

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

      <View>
        <ProfileCard
          completedEventsCount={24}
          pendingEventsCount={2}
        ></ProfileCard>
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

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">EventCard (create)</Text>
        <EventCard
          mode="create"
          draft={eventDraft}
          onChangeDraft={setEventDraft}
          onDatePress={() => {
            setIsDatePickerVisible(true);
          }}
          isConfirmDisabled={!isEventDraftValid}
          isSubmitting={isSubmittingEvent}
          onConfirm={() => {
            setIsSubmittingEvent(true);
            setTimeout(() => {
              setIsSubmittingEvent(false);
            }, 1500);
          }}
          testID="gallery-event-card-create"
        />
      </View>

      {isDatePickerVisible ? (
        <DatePickerSheet
          visible
          initialDate={eventDraft.date || undefined}
          onSelectDate={(date) => {
            setEventDraft((currentDraft) => ({ ...currentDraft, date }));
            setIsDatePickerVisible(false);
          }}
          onClose={() => {
            setIsDatePickerVisible(false);
          }}
        />
      ) : null}

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Pesquisar..."
        testID="gallery-search-bar"
      />
      <View className="flex-row gap-4 rounded-3xl bg-surface p-5">
        <View className="flex-1">
          <PlaceCard
            name="Bloom Café"
            address="Endereço"
            color="coral"
          />
        </View>
        <View className="flex-1">
          <PlaceCard
            name="Cinepolis Shopping Central"
            address="Endereço"
            color="lime"
          />
        </View>
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">FilterCarousel + FilterSheet</Text>
        <FilterCarousel
          tags={filterTags}
          selectedTagIds={selectedTagIds}
          onToggleTag={(id) => {
            setSelectedTagIds((current) =>
              current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id]
            );
          }}
          onOpenFilters={() => {
            setIsFilterSheetVisible(true);
          }}
          hasActiveFilters={JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTER_VALUE)}
          testID="gallery-filter-carousel"
        />
        <Text
          className="font-poppins text-xs text-ink"
          testID="gallery-filter-state"
        >
          {`Tags: ${selectedTagIds.join(', ') || '-'}\nFiltros: ${JSON.stringify(filters)}`}
        </Text>
      </View>

      <FilterSheet
        visible={isFilterSheetVisible}
        value={filters}
        groups={filterGroups}
        budgetTitle="Orçamento"
        onConfirm={(value) => {
          setFilters(value);
          setIsFilterSheetVisible(false);
        }}
        onClose={() => {
          setIsFilterSheetVisible(false);
        }}
        testID="gallery-filter-sheet"
      />

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">PlaceList</Text>
        <PlaceList
          places={places}
          isLoading={isLoading}
          error={error}
          onRetry={() => {
            void refetch();
          }}
          pageSize={4}
          testID="gallery-place-list"
        />
      </View>
    </ScrollView>
  );
}
