import { FilterCarousel } from '@/components/FilterCarousel';
import { EMPTY_FILTER_VALUE, FilterGroup, FilterSheet } from '@/components/FilterSheet';
import { NavigationBar } from '@/components/NavigationBar';
import { PlaceList } from '@/components/PlaceList';
import { SearchBar } from '@/components/SearchBar';
import { usePlaces } from '@/hooks/usePlaces';
import { theme } from '@/theme';
import { matchesPlaceFilters } from '@/utils/placeFilters';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

const CATEGORY_TAGS = [
  { id: 'recommended', label: 'Recomendados' },
  { id: 'restaurant', label: 'Restaurantes' },
  { id: 'class', label: 'Aulas' },
  { id: 'bar', label: 'Bares' },
];

const FILTER_GROUPS: FilterGroup[] = [
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

export function ExperiencesScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const { places, isLoading, error, refetch } = usePlaces();
  const [query, setQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [filters, setFilters] = useState(EMPTY_FILTER_VALUE);
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);

  const criteria = { query, tagIds: selectedTagIds, sheet: filters };
  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTER_VALUE);

  const handleToggleTag = (id: string) => {
    setSelectedTagIds((current) =>
      current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id]
    );
  };

  return (
    <View className="flex-1 bg-canvas">
      <View className="w-full max-w-2xl flex-1 self-center">
        <PlaceList
          places={places}
          filter={(place) => matchesPlaceFilters(place, criteria)}
          isLoading={isLoading}
          error={error}
          onRetry={() => {
            void refetch();
          }}
          contentContainerClassName="gap-4 px-6 pb-32 pt-6"
          header={
            <View className="gap-4">
              <SearchBar
                value={query}
                onChangeText={setQuery}
                testID="experiences-search"
              />

              <View className="items-center gap-1">
                <Text className={`pt-3 text-center text-4xl text-ink ${theme.typography.display}`}>
                  Experiências
                </Text>
                <Text className={`text-center text-sm text-wine ${theme.typography.body}`}>
                  Toque nas sugestões para saber mais
                </Text>
              </View>

              <View>
                <FilterCarousel
                  tags={CATEGORY_TAGS}
                  selectedTagIds={selectedTagIds}
                  onToggleTag={handleToggleTag}
                  onOpenFilters={() => {
                    setIsFilterSheetVisible(true);
                  }}
                  hasActiveFilters={hasActiveFilters}
                  testID="experiences-filters"
                />
              </View>
            </View>
          }
          testID="experiences-places"
        />
      </View>

      <NavigationBar groupId={groupId} />

      <FilterSheet
        visible={isFilterSheetVisible}
        value={filters}
        groups={FILTER_GROUPS}
        budgetTitle="Orçamento por pessoa"
        onConfirm={(value) => {
          setFilters(value);
          setIsFilterSheetVisible(false);
        }}
        onClose={() => {
          setIsFilterSheetVisible(false);
        }}
        testID="experiences-filter-sheet"
      />
    </View>
  );
}
