import { mockNotifications } from '@/server/mock/notifications';
import { fireEvent, render } from '@testing-library/react-native';
import { AppNotification, getNotificationPlainText, NotificationCard } from './index';

const [eventSuggested, moodRegistered, memoryAdded, ideaFavorited, memberJoined] =
  mockNotifications as [
    AppNotification,
    AppNotification,
    AppNotification,
    AppNotification,
    AppNotification,
  ];

describe('<NotificationCard />', () => {
  test.each([
    [eventSuggested, 'Um novo encontro foi sugerido!'],
    [
      moodRegistered,
      'May registrou que está se sentindo triste hoje. Que tal mandar uma mensagem ou sugerir um encontro?',
    ],
    [memoryAdded, 'Kata adicionou uma nova foto à Cápsula do Tempo. Confira!'],
    [ideaFavorited, 'Manu favoritou a ideia "Piquenique no Parque".'],
    [memberJoined, 'Manu entrou no "Hermanas"'],
  ])('builds the message for each notification type', (notification, expected) => {
    expect(getNotificationPlainText(notification)).toBe(expected);
  });

  test('renders the message built from props', async () => {
    const { getByText } = await render(<NotificationCard notification={memoryAdded} />);

    expect(getByText('Kata adicionou uma nova foto à Cápsula do Tempo. Confira!')).toBeTruthy();
  });

  test('shows the calendar action only for suggested events', async () => {
    const { getByTestId, rerender, queryByTestId } = await render(
      <NotificationCard notification={eventSuggested} />
    );

    expect(getByTestId('alibe-notification-card-action')).toBeTruthy();

    await rerender(<NotificationCard notification={memoryAdded} />);

    expect(queryByTestId('alibe-notification-card-action')).toBeNull();
  });

  test('calls onPress with the notification so the screen can open its group', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <NotificationCard
        notification={moodRegistered}
        onPress={onPress}
      />
    );

    await fireEvent.press(getByTestId('alibe-notification-card'));

    expect(onPress).toHaveBeenCalledWith(moodRegistered);
  });

  test('calls onPress from the calendar action too', async () => {
    const onPress = jest.fn();
    const { getByTestId } = await render(
      <NotificationCard
        notification={eventSuggested}
        onPress={onPress}
      />
    );

    await fireEvent.press(getByTestId('alibe-notification-card-action'));

    expect(onPress).toHaveBeenCalledWith(eventSuggested);
  });

  test('calls onDismiss with the notification id', async () => {
    const onDismiss = jest.fn();
    const { getByLabelText } = await render(
      <NotificationCard
        notification={ideaFavorited}
        onDismiss={onDismiss}
      />
    );

    await fireEvent.press(getByLabelText('Dispensar notificação'));

    expect(onDismiss).toHaveBeenCalledWith('notification-4');
  });

  test('hides the dismiss button without an onDismiss handler', async () => {
    const { queryByTestId } = await render(<NotificationCard notification={ideaFavorited} />);

    expect(queryByTestId('alibe-notification-card-dismiss')).toBeNull();
  });

  test('shows the group name only when requested', async () => {
    const { queryByTestId, rerender, getByTestId } = await render(
      <NotificationCard notification={memoryAdded} />
    );

    expect(queryByTestId('alibe-notification-card-group')).toBeNull();

    await rerender(
      <NotificationCard
        notification={memoryAdded}
        showGroupName
      />
    );

    expect(getByTestId('alibe-notification-card-group').props.children).toBe('Hermanas');
  });

  test('exposes an accessible label with the group and the message', async () => {
    const { getByLabelText } = await render(<NotificationCard notification={memberJoined} />);

    expect(getByLabelText('Abrir grupo Hermanas: Manu entrou no "Hermanas"')).toBeTruthy();
  });
});
