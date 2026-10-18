import type { AppNotification } from '@/components/NotificationCard';
import { mockNotifications } from './mock/notifications';

// TODO(ALI-94): swap for the real endpoints once the backend defines them.
// Until then every group gets a copy of the fixtures, kept in memory, so the
// screen can be built and tested against any real group id.
const MOCK_DELAY_MS = 400;

const store = new Map<string, AppNotification[]>();

function wait() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function getStoredNotifications(groupId: string): AppNotification[] {
  const stored = store.get(groupId);
  if (stored) {
    return stored;
  }

  const seeded = mockNotifications.map((notification) => ({
    ...notification,
    id: `${groupId}-${notification.id}`,
    groupId,
  }));
  store.set(groupId, seeded);

  return seeded;
}

export async function getGroupNotifications(groupId: string): Promise<AppNotification[]> {
  await wait();

  return getStoredNotifications(groupId);
}

export async function dismissNotification(groupId: string, notificationId: string): Promise<void> {
  await wait();

  store.set(
    groupId,
    getStoredNotifications(groupId).filter((notification) => notification.id !== notificationId)
  );
}

export async function clearGroupNotifications(groupId: string): Promise<void> {
  await wait();

  store.set(groupId, []);
}

export function resetMockNotifications() {
  store.clear();
}
