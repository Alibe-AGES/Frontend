// Mirrors the backend notification payload (GET /groups/{groupId}/notifications).
export type NotificationType = 'match' | 'createdEvent';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  eventId: string | null;
  locationId: string | null;
}

export interface NotificationCardProps {
  notification: AppNotification;
  onPress?: (notification: AppNotification) => void;
  onActionPress?: (notification: AppNotification) => void;
  onDismiss?: (id: string) => void;
  testID?: string;
}
