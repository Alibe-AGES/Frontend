import type { AppNotification } from '@/components/NotificationCard';

// Local fixtures until the notifications endpoint exists (ALI-94 / ALI-95).
export const mockNotifications: AppNotification[] = [
  {
    id: 'notification-1',
    type: 'event_suggested',
    groupId: 'group-hermanas',
    groupName: 'Hermanas',
    eventId: 'event-1',
    createdAt: '2026-10-14T12:00:00.000Z',
  },
  {
    id: 'notification-2',
    type: 'mood_registered',
    groupId: 'group-hermanas',
    groupName: 'Hermanas',
    actorName: 'May',
    mood: 'triste',
    createdAt: '2026-10-14T11:00:00.000Z',
  },
  {
    id: 'notification-3',
    type: 'memory_added',
    groupId: 'group-hermanas',
    groupName: 'Hermanas',
    actorName: 'Kata',
    createdAt: '2026-10-14T10:00:00.000Z',
  },
  {
    id: 'notification-4',
    type: 'idea_favorited',
    groupId: 'group-hermanas',
    groupName: 'Hermanas',
    actorName: 'Manu',
    ideaName: 'Piquenique no Parque',
    createdAt: '2026-10-14T09:00:00.000Z',
  },
  {
    id: 'notification-5',
    type: 'member_joined',
    groupId: 'group-hermanas',
    groupName: 'Hermanas',
    actorName: 'Manu',
    createdAt: '2026-10-14T08:00:00.000Z',
  },
];
