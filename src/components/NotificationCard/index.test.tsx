import { mockNotifications } from '@/server/mock/notifications';
import { fireEvent, render } from '@testing-library/react-native';
import { getNotificationContent, NotificationCard } from './index';

const [match, createdEvent] = mockNotifications;

describe('<NotificationCard />', () => {
  test.each([
    ['match', 'people-outline', 'Ver local'],
    ['createdEvent', 'calendar-outline', 'Ver encontro'],
  ] as const)('maps the %s type to its icon and action', (type, icon, actionLabel) => {
    expect(getNotificationContent(type)).toEqual({ icon, actionLabel });
  });

  test('renders the message sent by the backend', async () => {
    const { getByText } = await Promise.resolve(
      render(<NotificationCard notification={createdEvent} />)
    );

    expect(getByText('Kata criou um novo encontro: Café na Padre Chagas.')).toBeTruthy();
  });

  test('shows the action button only when there is an action handler', async () => {
    const { queryByTestId, rerender, getByText } = await Promise.resolve(
      render(<NotificationCard notification={match} />)
    );

    expect(queryByTestId('alibe-notification-card-action')).toBeNull();

    rerender(
      <NotificationCard
        notification={match}
        onActionPress={jest.fn()}
      />
    );
    await Promise.resolve();

    expect(getByText('Ver local')).toBeTruthy();
  });

  test('calls onPress with the notification when the card is tapped', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await Promise.resolve(
      render(
        <NotificationCard
          notification={createdEvent}
          onPress={onPress}
        />
      )
    );

    fireEvent.press(getByTestId('alibe-notification-card'));
    await Promise.resolve();

    expect(onPress).toHaveBeenCalledWith(createdEvent);
  });

  test('calls onActionPress from the action button', async () => {
    const onPress = jest.fn();
    const onActionPress = jest.fn();
    const { getByTestId } = await Promise.resolve(
      render(
        <NotificationCard
          notification={createdEvent}
          onPress={onPress}
          onActionPress={onActionPress}
        />
      )
    );

    fireEvent.press(getByTestId('alibe-notification-card-action'));
    await Promise.resolve();

    expect(onActionPress).toHaveBeenCalledWith(createdEvent);
    expect(onPress).not.toHaveBeenCalled();
  });

  test('calls onDismiss with the notification id', async () => {
    const onDismiss = jest.fn();
    const { getByLabelText } = await Promise.resolve(
      render(
        <NotificationCard
          notification={match}
          onDismiss={onDismiss}
        />
      )
    );

    fireEvent.press(getByLabelText('Dispensar notificação'));
    await Promise.resolve();

    expect(onDismiss).toHaveBeenCalledWith('notification-1');
  });

  test('hides the dismiss button without an onDismiss handler', async () => {
    const { queryByTestId } = await Promise.resolve(
      render(<NotificationCard notification={match} />)
    );

    expect(queryByTestId('alibe-notification-card-dismiss')).toBeNull();
  });

  test('exposes an accessible label with the message', async () => {
    const { getByLabelText } = await Promise.resolve(
      render(<NotificationCard notification={match} />)
    );

    expect(
      getByLabelText('Abrir grupo: Deu match! Todo mundo curtiu o Piquenique no Parque.')
    ).toBeTruthy();
  });
});
