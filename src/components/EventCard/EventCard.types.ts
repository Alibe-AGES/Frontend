import { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';

export type EventStatus = 'pending' | 'confirmed' | 'declined';

export interface EventLocation {
  description?: string | null;
  address?: string | null;
}

export interface EventCardEvent {
  id: string;
  name?: string | null;
  timeslot?: string | Date | null;
  budgetStart?: number | string | null;
  budgetEnd?: number | string | null;
  status?: EventStatus;
  location?: EventLocation | null;
  imageUrl?: string | null;
  phone?: string | null;
  openingHours?: string[] | null;
  website?: string | null;
}

export interface EventCardDraft {
  name: string;
  imageUri: string | null;
  address: string;
  date: string;
  time: string;
}

export type EventCardMode = 'read' | 'create';

export interface EventCardReadProps {
  mode?: 'read';
  event: EventCardEvent;
  onEditPress?: () => void;
  testID?: string;
}

export interface EventCardCreateProps {
  mode: 'create';
  draft: EventCardDraft;
  onChangeDraft: (draft: EventCardDraft) => void;
  onDatePress?: () => void;
  onImageSelected?: (photo: SelectedPhoto) => void;
  onConfirm?: () => void;
  isConfirmDisabled?: boolean;
  isSubmitting?: boolean;
  testID?: string;
}

export type EventCardProps = EventCardReadProps | EventCardCreateProps;
