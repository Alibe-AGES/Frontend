import RootLayout from '@/app/_layout';
import { AuthenticatedRoute } from '@/components/AuthenticatedRoute';
import { useFonts } from '@expo-google-fonts/poppins';
import { act, render, screen } from '@testing-library/react-native';
import { usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { AccessibilityInfo } from 'react-native';

jest.mock('@/global.css', () => ({}));

jest.mock('@expo-google-fonts/poppins', () => ({
  useFonts: jest.fn(),
}));

jest.mock('@/components/AuthenticatedRoute', () => ({
  AuthenticatedRoute: jest.fn(() => null),
}));

jest.mock('@/notifications/PushNotifications', () => ({
  PushNotifications: () => null,
}));

jest.mock('expo-router', () => ({
  usePathname: jest.fn(),
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
const mockUsePathname = usePathname as jest.Mock;
const mockAuthenticatedRoute = jest.mocked(AuthenticatedRoute);

async function renderLayout() {
  const result = render(<RootLayout />);
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
  return result;
}

describe('<RootLayout />', () => {
  beforeEach(() => {
    mockUseFonts.mockReturnValue([true]);
    mockUsePathname.mockReturnValue('/groups');
    jest.spyOn(AccessibilityInfo, 'isReduceMotionEnabled').mockResolvedValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows only the splash while the fonts are loading', async () => {
    mockUseFonts.mockReturnValue([false]);

    await renderLayout();

    expect(screen.getByTestId('splash-screen')).toBeTruthy();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
    expect(mockAuthenticatedRoute).not.toHaveBeenCalled();
  });

  test.each(['/groups', '/profile/user-123'])('protects private route %s', async (pathname) => {
    mockUsePathname.mockReturnValue(pathname);
    await renderLayout();

    expect(mockAuthenticatedRoute.mock.calls[0]?.[0].enabled).toBe(true);
  });

  test.each(['/', '/auth', '/login', '/sign-up', '/profile'])(
    'does not protect the public route %s',
    async (pathname) => {
      mockUsePathname.mockReturnValue(pathname);
      await renderLayout();

      expect(mockAuthenticatedRoute.mock.calls[0]?.[0].enabled).toBe(false);
    }
  );
});
