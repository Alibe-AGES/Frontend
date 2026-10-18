import {
  clearGroupNotifications,
  dismissNotification,
  getGroupNotifications,
  resetMockNotifications,
} from './notifications';

describe('notifications (mock)', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    resetMockNotifications();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  async function resolve<T>(promise: Promise<T>): Promise<T> {
    await jest.runAllTimersAsync();
    return promise;
  }

  test('seeds the fixtures for any group id', async () => {
    const notifications = await resolve(getGroupNotifications('group-1'));

    expect(notifications.length).toBeGreaterThan(0);
    expect(notifications.every((notification) => notification.groupId === 'group-1')).toBe(true);
  });

  test('dismisses a single notification', async () => {
    const [first] = await resolve(getGroupNotifications('group-1'));

    await resolve(dismissNotification('group-1', first.id));
    const remaining = await resolve(getGroupNotifications('group-1'));

    expect(remaining.map((notification) => notification.id)).not.toContain(first.id);
  });

  test('clears only the requested group', async () => {
    await resolve(clearGroupNotifications('group-1'));

    expect(await resolve(getGroupNotifications('group-1'))).toHaveLength(0);
    expect((await resolve(getGroupNotifications('group-2'))).length).toBeGreaterThan(0);
  });
});
