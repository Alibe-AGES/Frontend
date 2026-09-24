import { render } from '@testing-library/react-native';
import { ProfileCard } from './index';

describe('<ProfileCard />', () => {
  test('renders the completed and pending event counts', async () => {
    const { getByTestId } = await render(
      <ProfileCard
        avatarUrl="https://example.com/avatar.jpg"
        completedEventsCount={24}
        pendingEventsCount={2}
      />
    );

    expect(getByTestId('alibe-profile-card-completed-count')).toHaveTextContent('24');
    expect(getByTestId('alibe-profile-card-pending-count')).toHaveTextContent('2');
  });

  test('renders the labels for each stat', async () => {
    const { getByText } = await render(
      <ProfileCard
        avatarUrl="https://example.com/avatar.jpg"
        completedEventsCount={24}
        pendingEventsCount={2}
      />
    );

    expect(getByText('Eventos\nrealizados')).toBeTruthy();
    expect(getByText('Eventos\nem decisão')).toBeTruthy();
  });

  test('shows a placeholder icon when the avatar URL is null', async () => {
    const { getByTestId } = await render(
      <ProfileCard
        avatarUrl={null}
        completedEventsCount={0}
        pendingEventsCount={0}
      />
    );

    expect(getByTestId('alibe-profile-card-avatar-placeholder')).toBeTruthy();
  });

  test('renders zero counts as "0", not blank', async () => {
    const { getByTestId } = await render(
      <ProfileCard
        completedEventsCount={0}
        pendingEventsCount={0}
      />
    );

    expect(getByTestId('alibe-profile-card-completed-count')).toHaveTextContent('0');
    expect(getByTestId('alibe-profile-card-pending-count')).toHaveTextContent('0');
  });

  test('accepts a custom testID and applies it to children', async () => {
    const { getByTestId } = await render(
      <ProfileCard
        completedEventsCount={1}
        pendingEventsCount={1}
        testID="custom-profile-card"
      />
    );

    expect(getByTestId('custom-profile-card')).toBeTruthy();
    expect(getByTestId('custom-profile-card-completed-count')).toBeTruthy();
    expect(getByTestId('custom-profile-card-pending-count')).toBeTruthy();
    expect(getByTestId('custom-profile-card-avatar')).toBeTruthy();
  });

  test('applies custom className to the root container', async () => {
    const { getByTestId } = await render(
      <ProfileCard
        completedEventsCount={1}
        pendingEventsCount={1}
        className="mt-4 opacity-50"
      />
    );

    const rootContainer = getByTestId('alibe-profile-card');
    expect(rootContainer.props.className).toContain('mt-4 opacity-50');
  });
});
