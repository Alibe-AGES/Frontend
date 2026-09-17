import { GroupColor } from '@/utils/groupColors';

export interface GroupCardProps {
  id: string;
  name: string;
  color: GroupColor;
  photoUri?: string | null;
  membersPreview?: string;
  onPress?: (id: string) => void;
  testID?: string;
}
