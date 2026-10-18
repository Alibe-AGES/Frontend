import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { NotificationType } from './NotificationCard.types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface NotificationContent {
  icon: IoniconName;
  actionLabel: string;
}

const CONTENT_BY_TYPE: Record<NotificationType, NotificationContent> = {
  match: {
    icon: 'people-outline',
    actionLabel: 'Confira mais detalhes no calendário!',
  },
  createdEvent: {
    icon: 'calendar-outline',
    actionLabel: 'Ver encontro',
  },
};

export function getNotificationContent(type: NotificationType): NotificationContent {
  return CONTENT_BY_TYPE[type];
}
