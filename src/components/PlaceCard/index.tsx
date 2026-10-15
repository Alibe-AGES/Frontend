import StarFilledIcon from '@/assets/images/star-filled.svg';
import StarIcon from '@/assets/images/star.svg';
import { Image, Pressable, Text, View } from 'react-native';
import { PlaceCardColor, PlaceCardProps } from './PlaceCard.types';

export type { PlaceCardProps } from './PlaceCard.types';

const COLOR_CLASS: Record<PlaceCardColor, string> = {
  coral: 'bg-coral',
  lime: 'bg-lime',
  pink: 'bg-pink',
  wine: 'bg-wine',
};

export function PlaceCard({
  name,
  address,
  imageUri,
  color = 'coral',
  onClickCard,
  onToggleFavorite,
  isFavorite = false,
  testID = 'place-card',
}: PlaceCardProps) {
  return (
    <View className="w-full rounded-3xl bg-white shadow-md">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Abrir ${name}`}
        onPress={() => onClickCard?.(name)}
        className="w-full overflow-hidden rounded-3xl active:opacity-75"
        testID={testID}
      >
        <View className={`aspect-square w-full ${COLOR_CLASS[color]}`}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              accessibilityLabel={`Foto de ${name}`}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : null}
        </View>

        <View className="min-h-24 gap-1 px-3 pb-3 pt-3">
          <Text
            className="font-poppins-bold text-sm text-wine"
            numberOfLines={2}
            testID={`${testID}-name`}
          >
            {name}
          </Text>
          <Text
            className="font-poppins text-sm text-wine-soft"
            numberOfLines={2}
            testID={`${testID}-address`}
          >
            {address}
          </Text>
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isFavorite ? `Desfavoritar ${name}` : `Favoritar ${name}`}
        accessibilityState={{ selected: isFavorite }}
        onPress={onToggleFavorite}
        hitSlop={8}
        className="absolute right-3 top-3 h-9 w-9 items-center justify-center rounded-full bg-white active:opacity-75"
        testID={`${testID}-favorite`}
      >
        {isFavorite ? (
          <StarFilledIcon
            width={20}
            height={20}
          />
        ) : (
          <StarIcon
            width={20}
            height={20}
          />
        )}
      </Pressable>
    </View>
  );
}
