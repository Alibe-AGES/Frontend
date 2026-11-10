import { synchronizePushToken } from '@/notifications/synchronize-push-token';
import { authClient } from '@/server/auth';
import { act, renderHook } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import {
  GOOGLE_SIGN_IN_CONNECTION_MESSAGE,
  GOOGLE_SIGN_IN_NOT_COMPLETED_MESSAGE,
  useGoogleSignIn,
} from './useGoogleSignIn';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/server/auth', () => ({
  authClient: { signIn: { social: jest.fn() }, getSession: jest.fn() },
}));

jest.mock('@/notifications/synchronize-push-token', () => ({
  synchronizePushToken: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockSignInSocial = authClient.signIn.social as jest.Mock;
const mockGetSession = authClient.getSession as jest.Mock;
const mockSynchronizePushToken = synchronizePushToken as jest.MockedFunction<
  typeof synchronizePushToken
>;

describe('useGoogleSignIn', () => {
  const replace = jest.fn();

  beforeEach(() => {
    mockSignInSocial.mockResolvedValue({ data: { redirect: true }, error: null });
    mockGetSession.mockResolvedValue({ data: { session: { id: 'session-id' } }, error: null });
    mockSynchronizePushToken.mockResolvedValue('registered');
    mockUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('returns to the current screen after Google and routes to groups with a session', async () => {
    const { result } = await Promise.resolve(renderHook(() => useGoogleSignIn('/login')));

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(mockSignInSocial).toHaveBeenCalledWith({
      provider: 'google',
      callbackURL: '/login',
      errorCallbackURL: '/login',
    });
    expect(mockSynchronizePushToken).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/groups');
    expect(result.current.errorMessage).toBeUndefined();
    expect(result.current.isLoading).toBe(false);
  });

  test('stays on the screen when the browser returns without a session', async () => {
    mockGetSession.mockResolvedValueOnce({ data: null, error: null });
    const { result } = await Promise.resolve(renderHook(() => useGoogleSignIn('/sign-up')));

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.errorMessage).toBe(GOOGLE_SIGN_IN_NOT_COMPLETED_MESSAGE);
    expect(mockSynchronizePushToken).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  test('does not open the session check when the API rejects the Google sign-in', async () => {
    mockSignInSocial.mockResolvedValueOnce({ data: null, error: { status: 404 } });
    const { result } = await Promise.resolve(renderHook(() => useGoogleSignIn('/login')));

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.errorMessage).toBe(GOOGLE_SIGN_IN_NOT_COMPLETED_MESSAGE);
    expect(mockGetSession).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  test('shows a connection error when the request fails', async () => {
    mockSignInSocial.mockRejectedValueOnce(new Error('Network request failed'));
    const { result } = await Promise.resolve(renderHook(() => useGoogleSignIn('/login')));

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.errorMessage).toBe(GOOGLE_SIGN_IN_CONNECTION_MESSAGE);
    expect(result.current.isLoading).toBe(false);
    expect(replace).not.toHaveBeenCalled();
  });
});
