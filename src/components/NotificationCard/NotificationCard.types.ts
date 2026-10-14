// Provisional contract until the backend defines the notification payload (ALI-95).
export type NotificationType =
  'event_suggested' | 'mood_registered' | 'memory_added' | 'idea_favorited' | 'member_joined';

interface BaseNotification {
  id: string;
  groupId: string;
  groupName: string;
  createdAt: string;
}

export interface EventSuggestedNotification extends BaseNotification {
  type: 'event_suggested';
  eventId?: string;
}

export interface MoodRegisteredNotification extends BaseNotification {
  type: 'mood_registered';
  actorName: string;
  mood: string;
}

export interface MemoryAddedNotification extends BaseNotification {
  type: 'memory_added';
  actorName: string;
}

export interface IdeaFavoritedNotification extends BaseNotification {
  type: 'idea_favorited';
  actorName: string;
  ideaName: string;
}

export interface MemberJoinedNotification extends BaseNotification {
  type: 'member_joined';
  actorName: string;
}

export type AppNotification =
  | EventSuggestedNotification
  | MoodRegisteredNotification
  | MemoryAddedNotification
  | IdeaFavoritedNotification
  | MemberJoinedNotification;

export interface NotificationMessageSegment {
  text: string;
  bold?: boolean;
}

export interface NotificationCardProps {
  notification: AppNotification;
  onPress?: (notification: AppNotification) => void;
  onDismiss?: (id: string) => void;
  showGroupName?: boolean;
  testID?: string;
}
