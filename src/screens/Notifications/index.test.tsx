import { mockNotifications } from '@/server/mock/notifications';
import { fireEvent, render } from '@testing-library/react-native';
import { NotificationsScreen, NotificationsScreenProps } from '.';

jest.mock('@/components/NavigationBar', () => ({
  NavigationBar: () => null,
}));

jest.mock('@/components/BackButton', () => ({
  BackButton: () => null,
}));

jest.mock('@/hooks/use-authenticated-image-source', () => ({
  useAuthenticatedImageSource: () => null,
}));

async function renderScreen(overrides: Partial<NotificationsScreenProps> = {}) {
  const props: NotificationsScreenProps = {
    groupId: 'group-hermanas',
    groupName: 'Hermanas',
    groupPhoto: null,
    membersText: 'Eu, Kata, Manu e May',
    notifications: mockNotifications,
    hasMore: false,
    isLoading: false,
    isLoadingMore: false,
    isClearing: false,
    errorMessage: null,
    onPressNotification: jest.fn(),
    onActionPressNotification: jest.fn(),
    onDismissNotification: jest.fn(),
    onClearNotifications: jest.fn(),
    onLoadMore: jest.fn(),
    onRetry: jest.fn(),
    ...overrides,
  };

  const screen = await Promise.resolve(render(<NotificationsScreen {...props} />));

  return { props, ...screen };
}

describe('<NotificationsScreen />', () => {
  test('shows the title and the group in the floating header', async () => {
    const { getByText, getByTestId } = await renderScreen();

    expect(getByText('Hermanas')).toBeTruthy();
    expect(getByText('Eu, Kata, Manu e May')).toBeTruthy();
    expect(getByText('Notificações')).toBeTruthy();
    // The title and the group stay in the floating header while the list scrolls behind it.
    expect(getByTestId('screen-frame-header')).toContainElement(getByTestId('notifications-title'));
    expect(getByTestId('screen-frame-header')).toContainElement(getByTestId('notifications-group'));
    expect(getByTestId('screen-frame-top-fade')).toBeTruthy();
  });

  test('lists every notification with the clear button', async () => {
    const { getByTestId } = await renderScreen();

    for (const notification of mockNotifications) {
      expect(getByTestId(`notifications-card-${notification.id}`)).toBeTruthy();
    }
    expect(getByTestId('notifications-clear')).toBeTruthy();
    // Fixed in the header, above the list, instead of scrolling with it.
    expect(getByTestId('screen-frame-header')).toContainElement(getByTestId('notifications-clear'));
  });

  test('forwards card presses, dismissals and clear to the controller', async () => {
    const { props, getByTestId } = await renderScreen();

    fireEvent.press(getByTestId('notifications-card-notification-3'));
    await Promise.resolve();
    fireEvent.press(getByTestId('notifications-card-notification-2-action'));
    await Promise.resolve();
    fireEvent.press(getByTestId('notifications-card-notification-3-dismiss'));
    await Promise.resolve();
    fireEvent.press(getByTestId('notifications-clear'));
    await Promise.resolve();

    expect(props.onPressNotification).toHaveBeenCalledWith(mockNotifications[2]);
    expect(props.onActionPressNotification).toHaveBeenCalledWith(mockNotifications[1]);
    expect(props.onDismissNotification).toHaveBeenCalledWith('notification-3');
    expect(props.onClearNotifications).toHaveBeenCalledTimes(1);
  });

  test('shows the load more button only when there are more pages', async () => {
    const { queryByTestId, getByTestId, props } = await renderScreen({ hasMore: true });

    fireEvent.press(getByTestId('notifications-load-more'));
    await Promise.resolve();

    expect(props.onLoadMore).toHaveBeenCalledTimes(1);

    const { queryByTestId: queryWithoutMore } = await renderScreen({ hasMore: false });

    expect(queryByTestId('notifications-load-more')).toBeTruthy();
    expect(queryWithoutMore('notifications-load-more')).toBeNull();
  });

  test('shows the empty state when there are no notifications', async () => {
    const { getByText, queryByTestId } = await renderScreen({ notifications: [] });

    expect(getByText('Nenhuma novidade do grupo por enquanto')).toBeTruthy();
    expect(queryByTestId('notifications-clear')).toBeNull();
  });

  test('shows only the loading state while loading', async () => {
    const { getByTestId, queryByTestId } = await renderScreen({ isLoading: true });

    expect(getByTestId('notifications-loading')).toBeTruthy();
    expect(queryByTestId('notifications-empty')).toBeNull();
    expect(queryByTestId('notifications-clear')).toBeNull();
  });

  test('shows the error with a retry button', async () => {
    const { props, getByText, getByTestId, queryByTestId } = await renderScreen({
      notifications: [],
      errorMessage: 'Não foi possível carregar as notificações.',
    });

    expect(getByText('Não foi possível carregar as notificações.')).toBeTruthy();
    expect(queryByTestId('notifications-empty')).toBeNull();

    fireEvent.press(getByTestId('notifications-retry'));
    await Promise.resolve();

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });
});
