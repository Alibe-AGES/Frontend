import { act, render, waitFor } from '@testing-library/react-native';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { Platform } from 'react-native';
import { PushNotifications } from './PushNotifications';

let mockResponseListener: ((response: Notifications.NotificationResponse) => void) | null = null;

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  addNotificationResponseReceivedListener: jest.fn(
    (listener: (response: Notifications.NotificationResponse) => void) => {
      mockResponseListener = listener;
      return { remove: jest.fn() };
    }
  ),
  clearLastNotificationResponse: jest.fn(),
  getLastNotificationResponse: jest.fn().mockReturnValue(null),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const originalPlatform = Platform.OS;

function pushResponse(data: Record<string, unknown>, identifier = 'push-1') {
  return {
    notification: { request: { identifier, content: { data } } },
  } as Notifications.NotificationResponse;
}

describe('<PushNotifications />', () => {
  const push = jest.fn();

  beforeEach(() => {
    mockResponseListener = null;
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
  });

  test('opens the notification screen for the group in the push payload', async () => {
    await render(<PushNotifications />);

    await act(() => {
      mockResponseListener?.(pushResponse({ groupId: 'group-1' }));
    });

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/notifications',
      params: { id: 'group-1' },
    });
    expect(Notifications.clearLastNotificationResponse).toHaveBeenCalledTimes(1);
  });

  test('ignores pushes that do not identify a group', async () => {
    await render(<PushNotifications />);

    await act(() => {
      mockResponseListener?.(pushResponse({ type: 'test' }));
    });

    expect(push).not.toHaveBeenCalled();
  });

  test('opens the group screen when launched from a notification tap', async () => {
    jest
      .mocked(Notifications.getLastNotificationResponse)
      .mockReturnValueOnce(pushResponse({ groupId: 'group-2' }));

    await render(<PushNotifications />);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        pathname: '/group/[id]/notifications',
        params: { id: 'group-2' },
      });
    });
  });

  test('does not access native notification APIs on web', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    await render(<PushNotifications />);

    expect(Notifications.addNotificationResponseReceivedListener).not.toHaveBeenCalled();
    expect(Notifications.getLastNotificationResponse).not.toHaveBeenCalled();
  });
});
