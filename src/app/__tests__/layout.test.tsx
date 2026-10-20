import RootLayout from '@/app/_layout';
import { AuthenticatedRoute } from '@/components/AuthenticatedRoute';
import { useFonts } from '@expo-google-fonts/poppins';
import { render, screen } from '@testing-library/react-native';
import { usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';

jest.mock('@/global.css', () => ({}));

jest.mock('@expo-google-fonts/poppins', () => ({
  useFonts: jest.fn(),
}));

jest.mock('@/components/AuthenticatedRoute', () => ({
  AuthenticatedRoute: jest.fn(() => null),
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

describe('<RootLayout />', () => {
  beforeEach(() => {
    mockUseFonts.mockReturnValue([true]);
    mockUsePathname.mockReturnValue('/groups');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows only the splash while the fonts are loading', async () => {
    mockUseFonts.mockReturnValue([false]);

    await render(<RootLayout />);

    expect(screen.getByTestId('splash-screen')).toBeTruthy();
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
    expect(mockAuthenticatedRoute).not.toHaveBeenCalled();
  });

  test.each(['/groups', '/profile/user-123'])('protects private route %s', async (pathname) => {
    mockUsePathname.mockReturnValue(pathname);
    await render(<RootLayout />);

    expect(mockAuthenticatedRoute.mock.calls[0]?.[0].enabled).toBe(true);
  });

  test.each(['/', '/auth', '/login', '/sign-up'])(
    'does not protect the public route %s',
    async (pathname) => {
      mockUsePathname.mockReturnValue(pathname);
      await render(<RootLayout />);

      expect(mockAuthenticatedRoute.mock.calls[0]?.[0].enabled).toBe(false);
    }
  );
});
