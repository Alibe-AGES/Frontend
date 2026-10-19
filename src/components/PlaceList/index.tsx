import { PlaceCard } from '@/components/PlaceCard';
import { PlaceCardColor } from '@/components/PlaceCard/PlaceCard.types';
import { theme } from '@/theme';
import { FC, ReactElement, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { Place, PlaceListProps } from './PlaceList.types';

export type { Place, PlaceListProps } from './PlaceList.types';

// Fixed value until backend defines pagination size.
export const DEFAULT_PLACE_PAGE_SIZE = 6;

const NUM_COLUMNS = 2;
const SPACER_KEY = '__place-list-spacer';

const DEFAULT_CONTENT_CLASS_NAME = 'gap-4 pb-6';

const CARD_COLORS: PlaceCardColor[] = ['coral', 'lime', 'pink', 'wine'];

export const PlaceList: FC<PlaceListProps> = ({
  places,
  filter,
  pageSize = DEFAULT_PLACE_PAGE_SIZE,
  isLoading = false,
  error = null,
  onRetry,
  onPlacePress,
  header,
  contentContainerClassName = DEFAULT_CONTENT_CLASS_NAME,
  testID = 'alibe-place-list',
}) => {
  const [pageCount, setPageCount] = useState(1);

  // Loading, error and empty states keep the header and share the list's scrolling layout.
  const renderState = (state: ReactElement) =>
    header ? (
      <ScrollView
        contentContainerClassName={contentContainerClassName}
        keyboardShouldPersistTaps="handled"
      >
        {header}
        {state}
      </ScrollView>
    ) : (
      state
    );

  if (isLoading) {
    return renderState(
      <View
        className="items-center justify-center py-10"
        testID={`${testID}-loading`}
      >
        <ActivityIndicator color={theme.colors.ink} />
      </View>
    );
  }

  if (error) {
    return renderState(
      <View
        className="items-center justify-center gap-3 rounded-3xl bg-surface p-6"
        testID={`${testID}-error`}
      >
        <Text className="text-center font-poppins text-sm text-ink-soft">{error}</Text>
        {onRetry ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tentar novamente"
            onPress={onRetry}
            className="rounded-full bg-ink px-5 py-2 active:opacity-75"
          >
            <Text className="font-poppins-semibold text-sm text-white">Tentar novamente</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  const filteredPlaces = filter ? places.filter(filter) : places;

  if (filteredPlaces.length === 0) {
    return renderState(
      <View
        className="items-center justify-center rounded-3xl bg-surface p-6"
        testID={`${testID}-empty`}
      >
        <Text className="text-center font-poppins text-sm text-ink-soft">
          Nenhum local encontrado.
        </Text>
      </View>
    );
  }

  const visiblePlaces = filteredPlaces.slice(0, pageSize * pageCount);
  const hasMore = visiblePlaces.length < filteredPlaces.length;
  // A lone card in the last row keeps the width of a regular column instead of stretching.
  const entries: (Place | null)[] =
    visiblePlaces.length % NUM_COLUMNS === 0 ? visiblePlaces : [...visiblePlaces, null];

  return (
    <FlatList
      data={entries}
      numColumns={NUM_COLUMNS}
      keyExtractor={(place) => place?.id ?? SPACER_KEY}
      renderItem={({ item, index }) =>
        item ? (
          <View className="flex-1">
            <PlaceCard
              name={item.name}
              address={item.address}
              imageUri={item.photoUri}
              color={CARD_COLORS[index % CARD_COLORS.length]}
              onClickCard={() => onPlacePress?.(item.id)}
              testID={`${testID}-item-${item.id}`}
            />
          </View>
        ) : (
          <View className="flex-1" />
        )
      }
      columnWrapperClassName="gap-4"
      contentContainerClassName={contentContainerClassName}
      ListHeaderComponent={header}
      keyboardShouldPersistTaps="handled"
      onEndReached={() => {
        if (hasMore) {
          setPageCount((current) => current + 1);
        }
      }}
      onEndReachedThreshold={0.4}
      testID={testID}
    />
  );
};
