import { Ionicons } from '@expo/vector-icons';
import { ImageSource } from 'expo-image';
import { ComponentProps } from 'react';

export interface AvatarProps {
  photoUri?: string | ImageSource | null;
  accessibilityLabel: string;
  imageClassName?: string;
  fallbackIconName?: ComponentProps<typeof Ionicons>['name'];
  fallbackIconColor?: string;
  iconSize?: number;
  testID?: string;
}
