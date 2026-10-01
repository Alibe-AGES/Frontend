import { useAuthenticatedImageSource } from '@/hooks/use-authenticated-image-source';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { FC } from 'react';
import tw from 'twrnc';
import { AvatarProps } from './Avatar.types';

export type { AvatarProps } from './Avatar.types';

export const Avatar: FC<AvatarProps> = ({
  photoUri,
  accessibilityLabel,
  imageClassName = 'h-36 w-36 rounded-full',
  iconSize = 80,
  fallbackIconName = 'people-outline',
  fallbackIconColor = theme.colors.coral,
  testID = 'alibe-avatar',
}) => {
  const authenticatedImageSource = useAuthenticatedImageSource(
    typeof photoUri === 'string' ? photoUri : undefined
  );
  const imageSource = typeof photoUri === 'string' ? authenticatedImageSource : photoUri;

  if (imageSource) {
    return (
      <Image
        source={imageSource}
        accessible
        accessibilityLabel={accessibilityLabel}
        contentFit="cover"
        style={tw.style(imageClassName)}
        testID={`${testID}-photo`}
      />
    );
  }

  return (
    <Ionicons
      name={fallbackIconName}
      size={iconSize}
      color={fallbackIconColor}
      testID={`${testID}-placeholder`}
    />
  );
};
