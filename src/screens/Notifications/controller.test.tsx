import type { AppNotification } from '@/components/NotificationCard';
import { getEventDetails, type EventDetailsResponse } from '@/server/events';
import { getGroup, type GroupDetails } from '@/server/groups';
import { mockNotifications } from '@/server/mock/notifications';
import {
  getGroupNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/server/notifications';
import { act, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import NotificationsController from './controller';

interface CapturedProps {
  groupName: string;
  membersText: string;
  notifications: AppNotification[];
  hasMore: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onPressNotification: (notification: AppNotification) => void;
  onActionPressNotification: (notification: AppNotification) => void;
  onDismissNotification: (id: string) => void;
  onClearNotifications: () => void;
  onLoadMore: () => void;
}

let mockScreenProps: CapturedProps | null = null;

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/server/groups', () => ({
  getGroup: jest.fn(),
}));

jest.mock('@/server/events', () => ({
  getEventDetails: jest.fn(),
}));

jest.mock('@/server/notifications', () => ({
  getGroupNotifications: jest.fn(),
  markNotificationAsRead: jest.fn(),
  markAllNotificationsAsRead: jest.fn(),
}));

jest.mock('@/screens/Notifications', () => ({
  NotificationsScreen: (props: CapturedProps) => {
    mockScreenProps = props;
    return null;
  },
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetGroup = getGroup as jest.MockedFunction<typeof getGroup>;
const mockGetEventDetails = getEventDetails as jest.MockedFunction<typeof getEventDetails>;
const mockGetGroupNotifications = getGroupNotifications as jest.MockedFunction<
  typeof getGroupNotifications
>;
const mockMarkNotificationAsRead = markNotificationAsRead as jest.MockedFunction<
  typeof markNotificationAsRead
>;
const mockMarkAllNotificationsAsRead = markAllNotificationsAsRead as jest.MockedFunction<
  typeof markAllNotificationsAsRead
>;

function screenProps(): CapturedProps {
  if (!mockScreenProps) {
    throw new Error('NotificationsScreen was not rendered');
  }
  return mockScreenProps;
}

async function renderLoaded() {
  await render(<NotificationsController />);
  await waitFor(() => {
    expect(screenProps().isLoading).toBe(false);
  });
}

const [matchNotification, createdEventNotification] = mockNotifications;

const group = {
  id: 'group-hermanas',
  name: 'Hermanas',
  profilePic: null,
  participants: [
    { id: 'user-1', name: 'Kata', profilePic: null },
    { id: 'user-2', name: 'Manu', profilePic: null },
  ],
} as unknown as GroupDetails;

describe('NotificationsController', () => {
  const navigate = jest.fn();
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockScreenProps = null;
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-hermanas' });
    mockUseRouter.mockReturnValue({ navigate, push } as unknown as ReturnType<typeof useRouter>);
    mockGetGroup.mockResolvedValue(group);
    mockGetGroupNotifications.mockResolvedValue({
      notifications: mockNotifications,
      hasMore: false,
    });
    mockMarkNotificationAsRead.mockResolvedValue();
    mockMarkAllNotificationsAsRead.mockResolvedValue();
  });

  test('loads the group and the first page of notifications', async () => {
    await renderLoaded();

    expect(mockGetGroupNotifications).toHaveBeenCalledWith('group-hermanas', 1);
    expect(screenProps().groupName).toBe('Hermanas');
    expect(screenProps().membersText).toBe('Kata, Manu');
    expect(screenProps().notifications).toHaveLength(mockNotifications.length);
  });

  test('shows an error but keeps the group header when the notifications fail', async () => {
    mockGetGroupNotifications.mockRejectedValue(new Error('boom'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await render(<NotificationsController />);

    await waitFor(() => {
      expect(screenProps().errorMessage).toBe('Não foi possível carregar as notificações.');
    });
    expect(screenProps().groupName).toBe('Hermanas');
    expect(screenProps().membersText).toBe('Kata, Manu');
  });

  test('appends the next page without duplicates', async () => {
    mockGetGroupNotifications
      .mockResolvedValueOnce({ notifications: [matchNotification], hasMore: true })
      .mockResolvedValueOnce({
        notifications: [matchNotification, createdEventNotification],
        hasMore: false,
      });

    await renderLoaded();
    expect(screenProps().hasMore).toBe(true);

    await act(async () => {
      screenProps().onLoadMore();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screenProps().notifications.map((item) => item.id)).toEqual([
        'notification-1',
        'notification-2',
      ]);
    });
    expect(mockGetGroupNotifications).toHaveBeenLastCalledWith('group-hermanas', 2);
    expect(screenProps().hasMore).toBe(false);
  });

  test('opens the created event when its notification card is pressed', async () => {
    mockGetEventDetails.mockResolvedValue({
      groupId: 'group-hermanas',
      date: '2026-10-20',
    } as EventDetailsResponse);

    await renderLoaded();

    await act(async () => {
      screenProps().onPressNotification(createdEventNotification);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        pathname: '/group/[id]/day/[date]',
        params: { id: 'group-hermanas', date: '2026-10-20' },
      });
    });
    expect(mockGetEventDetails).toHaveBeenCalledWith('event-2');
  });

  test('opens location details using locationId for a match notification', async () => {
    await renderLoaded();

    await act(async () => {
      screenProps().onActionPressNotification(matchNotification);
      await Promise.resolve();
    });

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/experiences/[placeId]',
      params: {
        id: 'group-hermanas',
        placeId: 'location-1',
        isStoredLocation: 'true',
      },
    });
    expect(mockGetEventDetails).not.toHaveBeenCalled();
  });

  test('falls back to the group calendar when a notification has no matching detail id', async () => {
    await renderLoaded();

    await act(async () => {
      screenProps().onActionPressNotification({ ...matchNotification, locationId: null });
      await Promise.resolve();
    });

    expect(navigate).toHaveBeenCalledWith({
      pathname: '/group/[id]',
      params: { id: 'group-hermanas' },
    });
  });

  test('opens the event day when a created event action is pressed', async () => {
    mockGetEventDetails.mockResolvedValue({
      groupId: 'group-hermanas',
      date: '2026-10-20',
    } as EventDetailsResponse);

    await renderLoaded();

    await act(async () => {
      screenProps().onActionPressNotification(createdEventNotification);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith({
        pathname: '/group/[id]/day/[date]',
        params: { id: 'group-hermanas', date: '2026-10-20' },
      });
    });
    expect(mockGetEventDetails).toHaveBeenCalledWith('event-2');
  });

  test('falls back to the calendar when the event cannot be loaded', async () => {
    mockGetEventDetails.mockRejectedValue(new Error('boom'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await renderLoaded();

    await act(async () => {
      screenProps().onActionPressNotification(createdEventNotification);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith({
        pathname: '/group/[id]',
        params: { id: 'group-hermanas' },
      });
    });
  });

  test('marks a dismissed notification as read', async () => {
    await renderLoaded();

    await act(async () => {
      screenProps().onDismissNotification('notification-2');
      await Promise.resolve();
    });

    expect(mockMarkNotificationAsRead).toHaveBeenCalledWith('group-hermanas', 'notification-2');
    expect(screenProps().notifications.map((item) => item.id)).not.toContain('notification-2');
  });

  test('restores a notification when marking it as read fails', async () => {
    mockMarkNotificationAsRead.mockRejectedValue(new Error('boom'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await renderLoaded();

    await act(async () => {
      screenProps().onDismissNotification('notification-2');
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screenProps().notifications.map((item) => item.id)).toContain('notification-2');
    });
  });

  test('marks every notification as read when clearing', async () => {
    await renderLoaded();

    await act(async () => {
      screenProps().onClearNotifications();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screenProps().notifications).toHaveLength(0);
    });
    expect(mockMarkAllNotificationsAsRead).toHaveBeenCalledWith('group-hermanas');
  });
});
