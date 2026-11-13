import { Ionicons } from '@expo/vector-icons';
import { ImageProps, ImageSource } from 'expo-image';
import { ComponentProps } from 'react';

export interface AvatarProps {
  photoUri?: string | ImageSource | null;
  cachePolicy?: ImageProps['cachePolicy'];
  accessibilityLabel: string;
  imageClassName?: string;
  fallbackIconName?: ComponentProps<typeof Ionicons>['name'];
  fallbackIconColor?: string;
  iconSize?: number;
  testID?: string;
}
