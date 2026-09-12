import { GroupColor } from '@/utils/groupColors';

export interface GroupCardProps {
  id: string;
  name: string;
  color: GroupColor;
  photoUri?: string | null;
  onPress?: (id: string) => void;
  testID?: string;
}
