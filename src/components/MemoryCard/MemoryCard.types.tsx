export interface MemoryCardProps {
  date: Date;
  name: string;
  address: string;
  imageUri: string;
  imageHeaders?: Record<string, string>;
  testID?: string;
}
