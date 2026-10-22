import { PlaceCard } from '@/components/PlaceCard';
import { PlaceCardColor } from '@/components/PlaceCard/PlaceCard.types';
import { theme } from '@/theme';
import { FC, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { PlaceListProps } from './PlaceList.types';

export type { Place, PlaceListProps } from './PlaceList.types';

// Fixed value until backend defines pagination size.
export const DEFAULT_PLACE_PAGE_SIZE = 6;

const CARD_COLORS: PlaceCardColor[] = ['coral', 'lime', 'pink', 'wine'];

export const PlaceList: FC<PlaceListProps> = ({
  places,
  filter,
  pageSize = DEFAULT_PLACE_PAGE_SIZE,
  isLoading = false,
  error = null,
  onRetry,
  onPlacePress,
  testID = 'alibe-place-list',
}) => {
  const [pageCount, setPageCount] = useState(1);

  if (isLoading) {
    return (
      <View
        className="items-center justify-center py-10"
        testID={`${testID}-loading`}
      >
        <ActivityIndicator color={theme.colors.ink} />
      </View>
    );
  }

  if (error) {
    return (
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
    return (
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

  return (
    <FlatList
      data={visiblePlaces}
      numColumns={2}
      keyExtractor={(place) => place.id}
      renderItem={({ item, index }) => (
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
      )}
      columnWrapperClassName="gap-4"
      contentContainerClassName="gap-4 pb-6"
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
