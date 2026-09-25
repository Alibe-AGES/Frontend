import { render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { preloadGroups } from '@/hooks/useGroups';
import LoadingController from './controller';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useGroups', () => ({
  preloadGroups: jest.fn(),
}));

const mockPreloadGroups = preloadGroups as jest.MockedFunction<typeof preloadGroups>;
const mockReplace = jest.fn();
const mockRouter = { replace: mockReplace } as unknown as ReturnType<typeof useRouter>;

beforeEach(() => {
  jest.clearAllMocks();
  (useRouter as jest.Mock).mockReturnValue(mockRouter);
});

describe('<LoadingController />', () => {
  test('shows the loading screen while the next screen is loading', async () => {
    mockPreloadGroups.mockReturnValue(new Promise(() => undefined));

    const { getByTestId } = await render(<LoadingController />);

    expect(getByTestId('alibe-loading-screen')).toBeTruthy();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('navigates to the groups screen once everything is loaded', async () => {
    mockPreloadGroups.mockResolvedValue(undefined);

    await render(<LoadingController />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/groups');
    });
  });

  test('does not navigate after being unmounted', async () => {
    let resolvePreload: () => void = () => undefined;
    mockPreloadGroups.mockReturnValue(
      new Promise<void>((resolve) => {
        resolvePreload = resolve;
      })
    );

    const { unmount } = await render(<LoadingController />);
    await unmount();
    resolvePreload();
    await Promise.resolve();

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
