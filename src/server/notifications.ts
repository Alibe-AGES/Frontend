import type { AppNotification, NotificationType } from '@/components/NotificationCard';
import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import { authenticatedFetch } from './auth';

export const NOTIFICATIONS_PAGE_SIZE = 7;

export interface NotificationsPage {
  notifications: AppNotification[];
  hasMore: boolean;
}

interface RawNotification {
  id?: unknown;
  type?: unknown;
  message?: unknown;
  createdAt?: unknown;
  eventId?: unknown;
  eventID?: unknown;
}

interface RawPageMeta {
  totalPages?: unknown;
  lastPage?: unknown;
  hasNextPage?: unknown;
}

const NOTIFICATION_TYPES: readonly NotificationType[] = ['match', 'createdEvent'];

function isNotificationType(value: unknown): value is NotificationType {
  return NOTIFICATION_TYPES.includes(value as NotificationType);
}

function parseNotification(raw: RawNotification): AppNotification | null {
  if (typeof raw.id !== 'string' || !isNotificationType(raw.type)) {
    return null;
  }

  const eventId = raw.eventId ?? raw.eventID;

  return {
    id: raw.id,
    type: raw.type,
    message: typeof raw.message === 'string' ? raw.message : '',
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
    eventId: typeof eventId === 'string' ? eventId : null,
  };
}

// The pagination envelope is not final yet: accept a bare array or { data, meta }.
function parsePage(body: unknown, page: number, limit: number): NotificationsPage {
  const envelope = (body ?? {}) as { data?: unknown; items?: unknown; meta?: RawPageMeta };
  const rawList = Array.isArray(body) ? body : (envelope.data ?? envelope.items);
  const list = Array.isArray(rawList) ? (rawList as RawNotification[]) : [];
  const notifications = list
    .map(parseNotification)
    .filter((notification): notification is AppNotification => notification !== null);

  const meta = envelope.meta;
  const totalPages = meta?.totalPages ?? meta?.lastPage;
  const hasMore =
    typeof meta?.hasNextPage === 'boolean'
      ? meta.hasNextPage
      : typeof totalPages === 'number'
        ? page < totalPages
        : list.length >= limit;

  return { notifications, hasMore };
}

async function throwIfFailed(response: Response, fallback: string) {
  if (!response.ok) {
    const text = await response.text();
    throw new ApiError(text || response.statusText || fallback, response.status);
  }
}

export async function getGroupNotifications(
  groupId: string,
  page = 1,
  limit = NOTIFICATIONS_PAGE_SIZE
): Promise<NotificationsPage> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/groups/${groupId}/notifications?page=${String(page)}&limit=${String(limit)}`
  );

  await throwIfFailed(response, 'Não foi possível carregar as notificações');

  return parsePage(await response.json(), page, limit);
}

export async function markNotificationAsRead(
  groupId: string,
  notificationId: string
): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/groups/${groupId}/notifications/${notificationId}/read`,
    { method: 'PATCH' }
  );

  await throwIfFailed(response, 'Não foi possível marcar a notificação como lida');
}

export async function markAllNotificationsAsRead(groupId: string): Promise<void> {
  const response = await authenticatedFetch(
    `${API_BASE_URL}/groups/${groupId}/notifications/read`,
    { method: 'PATCH' }
  );

  await throwIfFailed(response, 'Não foi possível limpar as notificações');
}
