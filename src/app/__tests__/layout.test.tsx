import RootLayout from '@/app/_layout';
import { preloadGroups } from '@/hooks/useGroups';
import { authClient } from '@/server/auth-client';
import { useFonts } from '@expo-google-fonts/poppins';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter, useSegments } from 'expo-router';

jest.mock('@/global.css', () => ({}));

jest.mock('@expo-google-fonts/poppins', () => ({
  useFonts: jest.fn(),
}));

jest.mock('@/hooks/useGroups', () => ({
  preloadGroups: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useSegments: jest.fn(),
}));

jest.mock('expo-router/stack', () => ({
  Stack: Object.assign(() => null, { Screen: () => null }),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-standard-web-crypto', () => ({
  polyfillWebCrypto: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: () => null,
}));

const mockUseFonts = useFonts as jest.Mock;
const mockUseRouter = useRouter as jest.Mock;
const mockUseSegments = useSegments as jest.Mock;
const mockUseSession = authClient.useSession as jest.Mock;
const mockPreloadGroups = preloadGroups as jest.Mock;

function mockSession({ hasSession, isPending }: { hasSession: boolean; isPending: boolean }) {
  mockUseSession.mockReturnValue({
    data: hasSession ? { user: { id: 'user-1' } } : null,
    isPending,
  });
}

describe('<RootLayout />', () => {
  const replace = jest.fn();

  beforeEach(() => {
    mockUseFonts.mockReturnValue([true]);
    mockUseRouter.mockReturnValue({ replace });
    mockUseSegments.mockReturnValue([]);
    mockPreloadGroups.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders nothing while the fonts are loading', async () => {
    mockUseFonts.mockReturnValue([false]);
    mockSession({ hasSession: false, isPending: false });

    await render(<RootLayout />);

    expect(mockUseSession).not.toHaveBeenCalled();
  });

  test('waits for the session check before redirecting', async () => {
    mockSession({ hasSession: false, isPending: true });

    await render(<RootLayout />);

    expect(replace).not.toHaveBeenCalled();
  });

  test('sends a user without session to the auth screen on launch', async () => {
    mockSession({ hasSession: false, isPending: false });

    await render(<RootLayout />);

    expect(replace).toHaveBeenCalledWith('/auth');
    expect(mockPreloadGroups).not.toHaveBeenCalled();
  });

  test('sends a signed in user to the groups screen after preloading the groups', async () => {
    mockSession({ hasSession: true, isPending: false });

    await render(<RootLayout />);

    expect(mockPreloadGroups).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/groups');
    });
  });

  test('keeps the loading screen while the groups are preloading', async () => {
    mockSession({ hasSession: true, isPending: false });
    mockPreloadGroups.mockReturnValue(new Promise(() => undefined));
    const screen = await render(<RootLayout />);

    mockUseSession.mockReturnValue({ data: { user: { id: 'user-1' } }, isPending: false });
    await screen.rerender(<RootLayout />);

    expect(mockPreloadGroups).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  test('keeps the user on the current screen after the launch redirect when no redirect is needed', async () => {
    mockSession({ hasSession: true, isPending: false });
    const screen = await render(<RootLayout />);
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/groups');
    });
    replace.mockClear();

    mockUseSegments.mockReturnValue(['(app)']);
    await screen.rerender(<RootLayout />);

    expect(replace).not.toHaveBeenCalled();
  });
});
