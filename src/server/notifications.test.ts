import { API_BASE_URL } from '@/constants';
import { ApiError } from './api';
import {
  getGroupNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from './notifications';

jest.mock('./auth', () => ({
  authenticatedFetch: jest.fn((url: string, options?: RequestInit) =>
    globalThis.fetch(url, options)
  ),
}));

declare const global: { fetch: jest.Mock };

const originalFetch = global.fetch;

const RAW_NOTIFICATION = {
  id: 'n-1',
  type: 'createdEvent',
  message: 'Kata criou um novo encontro',
  createdAt: '2026-10-18T12:00:00.000Z',
  eventID: 'event-1',
};

function mockResponse(body: unknown, ok = true, status = 200) {
  global.fetch = jest.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? 'OK' : 'Error',
    json: () => Promise.resolve(body),
    text: () => Promise.resolve(ok ? '' : 'falhou'),
  });
}

describe('notifications client', () => {
  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('requests the group notifications with page and limit', async () => {
    mockResponse([RAW_NOTIFICATION]);

    await getGroupNotifications('group-1', 2, 7);

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/groups/group-1/notifications?page=2&limit=7`,
      undefined
    );
  });

  test('parses a bare array and normalizes eventID', async () => {
    mockResponse([RAW_NOTIFICATION]);

    const page = await getGroupNotifications('group-1');

    expect(page.notifications).toEqual([
      {
        id: 'n-1',
        type: 'createdEvent',
        message: 'Kata criou um novo encontro',
        createdAt: '2026-10-18T12:00:00.000Z',
        eventId: 'event-1',
      },
    ]);
    expect(page.hasMore).toBe(false);
  });

  test('assumes more pages when a bare array fills the limit', async () => {
    mockResponse([RAW_NOTIFICATION, { ...RAW_NOTIFICATION, id: 'n-2' }]);

    const page = await getGroupNotifications('group-1', 1, 2);

    expect(page.hasMore).toBe(true);
  });

  test('reads a { data, meta } envelope', async () => {
    mockResponse({ data: [RAW_NOTIFICATION], meta: { page: 1, totalPages: 3 } });

    const page = await getGroupNotifications('group-1', 1);

    expect(page.notifications).toHaveLength(1);
    expect(page.hasMore).toBe(true);
  });

  test('ignores notifications with unknown types', async () => {
    mockResponse([RAW_NOTIFICATION, { ...RAW_NOTIFICATION, id: 'n-2', type: 'other' }]);

    const page = await getGroupNotifications('group-1');

    expect(page.notifications.map((notification) => notification.id)).toEqual(['n-1']);
  });

  test('throws an ApiError when the request fails', async () => {
    mockResponse(null, false, 500);

    await expect(getGroupNotifications('group-1')).rejects.toBeInstanceOf(ApiError);
  });

  test('marks a single notification as read', async () => {
    mockResponse(null);

    await markNotificationAsRead('group-1', 'n-1');

    expect(global.fetch).toHaveBeenCalledWith(
      `${API_BASE_URL}/groups/group-1/notifications/n-1/read`,
      { method: 'PATCH' }
    );
  });

  test('marks every notification of the group as read', async () => {
    mockResponse(null);

    await markAllNotificationsAsRead('group-1');

    expect(global.fetch).toHaveBeenCalledWith(`${API_BASE_URL}/groups/group-1/notifications/read`, {
      method: 'PATCH',
    });
  });
});
