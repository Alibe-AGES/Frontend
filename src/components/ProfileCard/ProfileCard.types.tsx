import { ImageProps, ImageSource } from 'expo-image';

export interface ProfileCardProps {
  avatarUrl?: string | ImageSource | null;
  avatarCachePolicy?: ImageProps['cachePolicy'];
  completedEventsCount: number;
  pendingEventsCount: number;
  className?: string;
  testID?: string;
}
