import { createAvailability, getAvailabilitiesByDate } from '@/server/availabilities';
import { render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AvailabilityController from './controller';

let mockAvailabilityProps: Record<string, unknown> = {};

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/server/availabilities', () => ({
  createAvailability: jest.fn(),
  getAvailabilitiesByDate: jest.fn(),
}));

jest.mock('@/screens/Availability', () => ({
  AvailabilityScreen: (props: Record<string, unknown>) => {
    mockAvailabilityProps = props;
    return null;
  },
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetAvailabilitiesByDate = getAvailabilitiesByDate as jest.MockedFunction<
  typeof getAvailabilitiesByDate
>;
const mockCreateAvailability = createAvailability as jest.MockedFunction<typeof createAvailability>;

describe('AvailabilityController', () => {
  const back = jest.fn();
  const replace = jest.fn();
  const canGoBack = jest.fn();

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1', date: '2026-09-14' });
    mockUseRouter.mockReturnValue({ back, replace, canGoBack } as unknown as ReturnType<
      typeof useRouter
    >);
    mockGetAvailabilitiesByDate.mockResolvedValue([
      { id: 'user-1', name: 'Ana', profilePic: null },
      { id: 'user-2', name: 'Bia', profilePic: 'https://example.com/bia.png' },
    ]);
    mockCreateAvailability.mockResolvedValue([]);
    canGoBack.mockReturnValue(true);
    mockAvailabilityProps = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads participants and supplies an avatar fallback', async () => {
    await render(<AvailabilityController />);

    await waitFor(() => {
      expect(mockGetAvailabilitiesByDate).toHaveBeenCalledWith('group-1', '2026-09-14');
      expect(mockAvailabilityProps.participants).toEqual([
        {
          id: 'user-1',
          name: 'Ana',
          avatarUrl: 'https://ui-avatars.com/api/?name=Ana&background=random',
        },
        { id: 'user-2', name: 'Bia', avatarUrl: 'https://example.com/bia.png' },
      ]);
    });
    expect(mockAvailabilityProps.date).toBe('2026-09-14');
  });

  test('submits only complete intervals and navigates back', async () => {
    await render(<AvailabilityController />);
    const onConfirm = mockAvailabilityProps.onConfirm as (intervals: unknown[]) => Promise<void>;

    await onConfirm([
      { startTime: '09:00', endTime: '10:00' },
      { startTime: '', endTime: '11:00' },
      { startTime: '12:00', endTime: '' },
    ]);

    expect(mockCreateAvailability).toHaveBeenCalledWith('group-1', {
      date: '2026-09-14',
      intervals: [{ startTime: '09:00', endTime: '10:00' }],
    });
    expect(back).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  test('replaces the route when confirming without back history', async () => {
    canGoBack.mockReturnValue(false);
    await render(<AvailabilityController />);
    const onConfirm = mockAvailabilityProps.onConfirm as (intervals: unknown[]) => Promise<void>;

    await onConfirm([]);

    expect(replace).toHaveBeenCalledWith('/group/group-1');
  });

  test('declines by going back or replacing the route', async () => {
    await render(<AvailabilityController />);
    const onDecline = mockAvailabilityProps.onDecline as () => void;

    onDecline();
    expect(back).toHaveBeenCalledTimes(1);

    canGoBack.mockReturnValue(false);
    onDecline();
    expect(replace).toHaveBeenCalledWith('/group/group-1');
  });
});
