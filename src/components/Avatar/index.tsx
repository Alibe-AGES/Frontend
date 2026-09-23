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
  testID = 'alibe-avatar',
}) => {
  if (photoUri) {
    return (
      <Image
        source={{ uri: photoUri }}
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
      name="people-outline"
      size={iconSize}
      color={theme.colors.coral}
      testID={`${testID}-placeholder`}
    />
  );
};
