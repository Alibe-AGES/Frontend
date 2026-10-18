import type { AppNotification } from '@/components/NotificationCard';
import { getGroup, type GroupDetails } from '@/server/groups';
import { mockNotifications } from '@/server/mock/notifications';
import {
  clearGroupNotifications,
  dismissNotification,
  getGroupNotifications,
} from '@/server/notifications';
import { act, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import NotificationsController from './controller';

interface CapturedProps {
  groupName: string;
  membersText: string;
  notifications: AppNotification[];
  isLoading: boolean;
  errorMessage: string | null;
  onPressNotification: (notification: AppNotification) => void;
  onDismissNotification: (id: string) => void;
  onClearNotifications: () => void;
}

let mockScreenProps: CapturedProps | null = null;

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/server/groups', () => ({
  getGroup: jest.fn(),
}));

jest.mock('@/server/notifications', () => ({
  getGroupNotifications: jest.fn(),
  dismissNotification: jest.fn(),
  clearGroupNotifications: jest.fn(),
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
const mockGetGroupNotifications = getGroupNotifications as jest.MockedFunction<
  typeof getGroupNotifications
>;
const mockDismissNotification = dismissNotification as jest.MockedFunction<
  typeof dismissNotification
>;
const mockClearGroupNotifications = clearGroupNotifications as jest.MockedFunction<
  typeof clearGroupNotifications
>;

function screenProps(): CapturedProps {
  if (!mockScreenProps) {
    throw new Error('NotificationsScreen was not rendered');
  }
  return mockScreenProps;
}

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

  beforeEach(() => {
    jest.clearAllMocks();
    mockScreenProps = null;
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-hermanas' });
    mockUseRouter.mockReturnValue({ navigate } as unknown as ReturnType<typeof useRouter>);
    mockGetGroup.mockResolvedValue(group);
    mockGetGroupNotifications.mockResolvedValue(mockNotifications);
    mockDismissNotification.mockResolvedValue();
    mockClearGroupNotifications.mockResolvedValue();
  });

  test('loads the group and its notifications', async () => {
    await render(<NotificationsController />);

    await waitFor(() => {
      expect(screenProps().isLoading).toBe(false);
    });

    expect(mockGetGroupNotifications).toHaveBeenCalledWith('group-hermanas');
    expect(screenProps().groupName).toBe('Hermanas');
    expect(screenProps().membersText).toBe('Kata, Manu');
    expect(screenProps().notifications).toHaveLength(mockNotifications.length);
  });

  test('shows an error when loading fails', async () => {
    mockGetGroupNotifications.mockRejectedValue(new Error('boom'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await render(<NotificationsController />);

    await waitFor(() => {
      expect(screenProps().errorMessage).toBe('Não foi possível carregar as notificações.');
    });
  });

  test('opens the notification group when a card is pressed', async () => {
    await render(<NotificationsController />);
    await waitFor(() => {
      expect(screenProps().isLoading).toBe(false);
    });

    await act(async () => {
      screenProps().onPressNotification(mockNotifications[0]);
      await Promise.resolve();
    });

    expect(navigate).toHaveBeenCalledWith({
      pathname: '/group/[id]',
      params: { id: 'group-hermanas' },
    });
  });

  test('removes a dismissed notification', async () => {
    await render(<NotificationsController />);
    await waitFor(() => {
      expect(screenProps().isLoading).toBe(false);
    });

    await act(async () => {
      screenProps().onDismissNotification('notification-2');
      await Promise.resolve();
    });

    expect(mockDismissNotification).toHaveBeenCalledWith('group-hermanas', 'notification-2');
    expect(screenProps().notifications.map((item) => item.id)).not.toContain('notification-2');
  });

  test('restores a notification when dismissing fails', async () => {
    mockDismissNotification.mockRejectedValue(new Error('boom'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await render(<NotificationsController />);
    await waitFor(() => {
      expect(screenProps().isLoading).toBe(false);
    });

    await act(async () => {
      screenProps().onDismissNotification('notification-2');
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screenProps().notifications.map((item) => item.id)).toContain('notification-2');
    });
  });

  test('clears every notification of the group', async () => {
    await render(<NotificationsController />);
    await waitFor(() => {
      expect(screenProps().isLoading).toBe(false);
    });

    await act(async () => {
      screenProps().onClearNotifications();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screenProps().notifications).toHaveLength(0);
    });
    expect(mockClearGroupNotifications).toHaveBeenCalledWith('group-hermanas');
  });
});
