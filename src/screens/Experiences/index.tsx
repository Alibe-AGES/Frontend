import { FilterCarousel } from '@/components/FilterCarousel';
import { EMPTY_FILTER_VALUE, FilterSheet } from '@/components/FilterSheet';
import { NavigationBar } from '@/components/NavigationBar';
import { PlaceList } from '@/components/PlaceList';
import { SearchBar } from '@/components/SearchBar';
import { usePlaces } from '@/hooks/usePlaces';
import { theme } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CATEGORY_TAGS, FILTER_GROUPS } from './filters';

export function ExperiencesScreen() {
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [filters, setFilters] = useState(EMPTY_FILTER_VALUE);
  const [isFilterSheetVisible, setIsFilterSheetVisible] = useState(false);
  const { places, isLoading, error, refetch } = usePlaces({
    query,
    tagIds: selectedTagIds,
    filters,
  });

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
          isLoading={isLoading}
          error={error}
          onRetry={() => {
            void refetch();
          }}
          onPlacePress={(placeId) => {
            router.push(`/group/${groupId}/experiences/${encodeURIComponent(placeId)}`);
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
