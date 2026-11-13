import type { ImageSource } from 'expo-image';

export interface MemoryCardProps {
  date: Date;
  name: string;
  address: string;
  imageUri: string;
  imageHeaders?: Record<string, string>;
  imageSource?: ImageSource | null;
  testID?: string;
}
