import RootLayout from '@/app/_layout';
import { authClient } from '@/server/auth-client';
import { useFonts } from '@expo-google-fonts/poppins';
import { render } from '@testing-library/react-native';
import { useRouter, useSegments } from 'expo-router';

jest.mock('@/global.css', () => ({}));

jest.mock('@expo-google-fonts/poppins', () => ({
  useFonts: jest.fn(),
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
  });

  test('sends a signed in user to the groups screen on launch', async () => {
    mockSession({ hasSession: true, isPending: false });

    await render(<RootLayout />);

    expect(replace).toHaveBeenCalledWith('/groups');
  });

  test('keeps the user on the current screen after the launch redirect when no redirect is needed', async () => {
    mockSession({ hasSession: true, isPending: false });
    const screen = await render(<RootLayout />);
    replace.mockClear();

    mockUseSegments.mockReturnValue(['(app)']);
    await screen.rerender(<RootLayout />);

    expect(replace).not.toHaveBeenCalled();
  });
});
