import { FilterCarousel } from '@/components/FilterCarousel';
import { EMPTY_FILTER_VALUE, FilterSheet, hasActiveFilters } from '@/components/FilterSheet';
import { BackButton } from '@/components/BackButton';
import { NavigationBar } from '@/components/NavigationBar';
import { PlaceList } from '@/components/PlaceList';
import { ScreenFrame, type ScreenFrameLayout } from '@/components/ScreenFrame';
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

  const handleToggleTag = (id: string) => {
    setSelectedTagIds((current) =>
      current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id]
    );
  };

  return (
    <>
      <ScreenFrame
        scrollable={false}
        padding="horizontal"
        floatingChrome
        topFade="header"
        header={
          <View>
            <View className="flex-row items-center gap-4">
              <BackButton
                fallbackHref={groupId ? `/group/${groupId}` : '/groups'}
                accessibilityLabel="Voltar para o grupo"
                testID="experiences-back"
              />
              <View className="flex-1">
                <SearchBar
                  value={query}
                  onChangeText={setQuery}
                  testID="experiences-search"
                />
              </View>
            </View>

            <View className="mb-8 mt-8 items-center gap-2">
              <Text className={`text-center font-poppins-medium text-4xl tracking-wide text-wine`}>
                Experiências
              </Text>
              <Text className={`text-md text-center text-wine ${theme.typography.body}`}>
                Toque nas sugestões para saber mais
              </Text>
            </View>

            <FilterCarousel
              tags={CATEGORY_TAGS}
              selectedTagIds={selectedTagIds}
              onToggleTag={handleToggleTag}
              onOpenFilters={() => {
                setIsFilterSheetVisible(true);
              }}
              hasActiveFilters={hasActiveFilters(filters)}
              fullBleed
              testID="experiences-filters"
            />
          </View>
        }
        footer={<NavigationBar groupId={groupId} />}
      >
        {({ topInset, bottomInset }: ScreenFrameLayout) => (
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
            contentContainerClassName="gap-4"
            header={
              <View
                className="-mb-4"
                style={{ height: topInset }}
              />
            }
            footer={<View style={{ height: bottomInset }} />}
            testID="experiences-places"
          />
        )}
      </ScreenFrame>

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
    </>
  );
}
