import { ErrorCard } from '@/components/ErrorCard';
import { PlaceCard } from '@/components/PlaceCard';
import { PlaceCardColor } from '@/components/PlaceCard/PlaceCard.types';
import { theme } from '@/theme';
import { FC, ReactElement, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, Text, View } from 'react-native';
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
  footer,
  contentContainerClassName = DEFAULT_CONTENT_CLASS_NAME,
  testID = 'alibe-place-list',
}) => {
  const [pageCount, setPageCount] = useState(1);

  // Loading, error and empty states keep the header and footer and the list's scrolling layout.
  const renderState = (state: ReactElement) =>
    header || footer ? (
      <ScrollView
        contentContainerClassName={contentContainerClassName}
        keyboardShouldPersistTaps="handled"
      >
        {header}
        {state}
        {footer}
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
      <ErrorCard
        message={error}
        onRetry={onRetry}
        testID={`${testID}-error`}
      />
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
              imageHeaders={item.photoHeaders}
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
      ListFooterComponent={footer}
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
