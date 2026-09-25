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

export interface EventCardProps {
  event: EventCardEvent;
  onEditPress?: () => void;
  testID?: string;
}
