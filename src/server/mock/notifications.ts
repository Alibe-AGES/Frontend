import type { AppNotification } from '@/components/NotificationCard';

// Fictional fixtures for the component gallery and tests.
export const mockNotifications: AppNotification[] = [
  {
    id: 'notification-1',
    type: 'match',
    message: 'Deu match! Todo mundo curtiu o Piquenique no Parque.',
    createdAt: '2026-10-14T12:00:00.000Z',
    eventId: null,
    locationId: 'location-1',
  },
  {
    id: 'notification-2',
    type: 'createdEvent',
    message: 'Kata criou um novo encontro: Café na Padre Chagas.',
    createdAt: '2026-10-14T11:00:00.000Z',
    eventId: 'event-2',
    locationId: null,
  },
  {
    id: 'notification-3',
    type: 'createdEvent',
    message: 'Manu criou um novo encontro: Cinema no sábado.',
    createdAt: '2026-10-14T10:00:00.000Z',
    eventId: 'event-3',
    locationId: null,
  },
];
