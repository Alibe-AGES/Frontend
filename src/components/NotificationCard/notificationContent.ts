import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';
import { AppNotification, NotificationMessageSegment } from './NotificationCard.types';

type IoniconName = ComponentProps<typeof Ionicons>['name'];

export interface NotificationContent {
  icon: IoniconName;
  message: NotificationMessageSegment[];
  actionLabel?: string;
}

export function getNotificationContent(notification: AppNotification): NotificationContent {
  switch (notification.type) {
    case 'event_suggested':
      return {
        icon: 'people-outline',
        message: [{ text: 'Um novo encontro foi sugerido!', bold: true }],
        actionLabel: 'Confira mais detalhes no calendário!',
      };
    case 'mood_registered':
      return {
        icon: 'sad-outline',
        message: [
          { text: notification.actorName, bold: true },
          { text: ' registrou que está se sentindo ' },
          { text: notification.mood, bold: true },
          { text: ' hoje. Que tal mandar uma mensagem ou sugerir um encontro?' },
        ],
      };
    case 'memory_added':
      return {
        icon: 'heart-outline',
        message: [
          {
            text: `${notification.actorName} adicionou uma nova foto à Cápsula do Tempo. Confira!`,
          },
        ],
      };
    case 'idea_favorited':
      return {
        icon: 'star-outline',
        message: [
          { text: `${notification.actorName} favoritou`, bold: true },
          { text: ' a ideia ' },
          { text: `"${notification.ideaName}"`, bold: true },
          { text: '.' },
        ],
      };
    case 'member_joined':
      return {
        icon: 'person-outline',
        message: [
          { text: notification.actorName, bold: true },
          { text: ' entrou no ' },
          { text: `"${notification.groupName}"`, bold: true },
        ],
      };
  }
}

export function getNotificationPlainText(notification: AppNotification): string {
  return getNotificationContent(notification)
    .message.map((segment) => segment.text)
    .join('');
}
