import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
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

  test('keeps the navigator mounted while checking the session', async () => {
    let resolveSessionCheck!: (user: Awaited<ReturnType<typeof getMe>>) => void;
    mockGetMe.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSessionCheck = resolve;
        })
    );
    const onProtectedPageMount = jest.fn();
    function ProtectedPage() {
      useEffect(() => {
        onProtectedPageMount();
      }, []);

      return <Text>Protected page</Text>;
    }

    const { getByTestId, queryByTestId } = await render(
      <AuthenticatedRoute>
        <ProtectedPage />
      </AuthenticatedRoute>
    );

    expect(onProtectedPageMount).toHaveBeenCalledTimes(1);
    expect(getByTestId('auth-check-loading')).toBeTruthy();

    await act(() => {
      resolveSessionCheck({ id: 'user-1', name: 'User', profilePic: null });
    });
    expect(queryByTestId('auth-check-loading')).toBeNull();
  });

  test('keeps public content mounted while switching into protected routes', async () => {
    mockGetMe.mockResolvedValue({ id: 'user-1', name: 'User', profilePic: null });
    const onPageMount = jest.fn();
    function CurrentPage() {
      useEffect(() => {
        onPageMount();
      }, []);

      return <Text>Current page</Text>;
    }

    const { getByText, rerender } = await render(
      <AuthenticatedRoute enabled={false}>
        <CurrentPage />
      </AuthenticatedRoute>
    );

    expect(getByText('Current page')).toBeTruthy();
    expect(mockGetMe).not.toHaveBeenCalled();

    await rerender(
      <AuthenticatedRoute enabled>
        <CurrentPage />
      </AuthenticatedRoute>
    );

    await waitFor(() => {
      expect(mockGetMe).toHaveBeenCalledTimes(1);
      expect(getByText('Current page')).toBeTruthy();
    });
    expect(onPageMount).toHaveBeenCalledTimes(1);
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
