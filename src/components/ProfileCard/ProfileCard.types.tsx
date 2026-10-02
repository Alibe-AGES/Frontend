import { ImageSource } from 'expo-image';

export interface ProfileCardProps {
  avatarUrl?: string | ImageSource | null;
  completedEventsCount: number;
  pendingEventsCount: number;
  className?: string;
  testID?: string;
}
