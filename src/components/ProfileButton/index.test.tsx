import { fireEvent, render } from '@testing-library/react-native';

import { ProfileButton } from './index';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/server/mock/useAuth', () => ({
  useAuth: () => ({ userId: 'user-1' }),
}));

describe('<ProfileButton />', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test('opens the profile of the authenticated user', async () => {
    const { getByTestId } = await render(<ProfileButton />);

    await fireEvent.press(getByTestId('alibe-profile-button'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(profile)/profile/[userId]',
      params: { userId: 'user-1' },
    });
  });

  test('keeps the group context when a group is given', async () => {
    const { getByTestId } = await render(<ProfileButton groupId="g1" />);

    await fireEvent.press(getByTestId('alibe-profile-button'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/(profile)/profile/[userId]',
      params: { userId: 'user-1', groupId: 'g1' },
    });
  });

  test('exposes an accessible label and honours a custom testID', async () => {
    const { getByLabelText, getByTestId } = await render(
      <ProfileButton testID="group-screen-profile" />
    );

    expect(getByLabelText('Perfil do usuário')).toBeTruthy();
    expect(getByTestId('group-screen-profile')).toBeTruthy();
  });
});
