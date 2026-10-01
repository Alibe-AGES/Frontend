import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native';

import { getMe } from '@/server/groups';
import { AuthenticatedRoute } from '.';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/server/groups', () => ({
  getMe: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetMe = getMe as jest.MockedFunction<typeof getMe>;

describe('<AuthenticatedRoute />', () => {
  const replace = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders protected content after the current user is confirmed', async () => {
    mockGetMe.mockResolvedValue({ id: 'user-1', name: 'User', profilePic: null });

    const { getByText } = await render(
      <AuthenticatedRoute>
        <Text>Protected page</Text>
      </AuthenticatedRoute>
    );

    await waitFor(() => {
      expect(getByText('Protected page')).toBeTruthy();
    });
  });

  test('shows the access error and routes to login when the session is rejected', async () => {
    mockGetMe.mockRejectedValue(new Error('Unauthorized'));

    const { getByText, getByTestId, queryByText } = await render(
      <AuthenticatedRoute>
        <Text>Protected page</Text>
      </AuthenticatedRoute>
    );

    await waitFor(() => {
      expect(getByText('Acesso restrito')).toBeTruthy();
    });
    expect(queryByText('Protected page')).toBeNull();

    await fireEvent.press(getByTestId('authentication-required-login'));
    expect(replace).toHaveBeenCalledWith('/login');
  });
});
