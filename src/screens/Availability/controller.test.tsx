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

async function renderController() {
  await render(<AvailabilityController />);
  await waitFor(() => {
    expect(mockAvailabilityProps.participants).toHaveLength(2);
  });
}

describe('AvailabilityController', () => {
  const back = jest.fn();
  const replace = jest.fn();
  const canGoBack = jest.fn();

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1', date: '2026-09-14' });
    mockUseRouter.mockReturnValue({ back, replace, canGoBack } as unknown as ReturnType<
      typeof useRouter
    >);
    mockGetAvailabilitiesByDate.mockResolvedValue({
      date: '2026-09-14',
      users: [
        {
          id: 'user-1',
          name: 'Ana',
          image: null,
          isCurrentUser: true,
          availableAllDay: false,
          intervals: [['14:00', '20:00']],
        },
        {
          id: 'user-2',
          name: 'Bia',
          image: 'https://example.com/bia.png',
          isCurrentUser: false,
          availableAllDay: true,
          intervals: [],
        },
        {
          id: 'user-3',
          name: 'Clara',
          image: null,
          isCurrentUser: false,
          availableAllDay: false,
          intervals: [],
        },
      ],
    });
    mockCreateAvailability.mockResolvedValue([]);
    canGoBack.mockReturnValue(true);
    mockAvailabilityProps = {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads the available participants, skipping anyone without a day or interval', async () => {
    await renderController();

    expect(mockGetAvailabilitiesByDate).toHaveBeenCalledWith('group-1', '2026-09-14');
    expect(mockAvailabilityProps.participants).toEqual([
      {
        id: 'user-1',
        name: 'Ana',
        photoUri: null,
        isCurrentUser: true,
        availableAllDay: false,
        intervals: [['14:00', '20:00']],
      },
      {
        id: 'user-2',
        name: 'Bia',
        photoUri: 'https://example.com/bia.png',
        isCurrentUser: false,
        availableAllDay: true,
        intervals: [],
      },
    ]);
    expect(mockAvailabilityProps.isLoadingParticipants).toBe(false);
    expect(mockAvailabilityProps.date).toBe('2026-09-14');
  });

  test('submits only complete intervals and navigates back', async () => {
    await renderController();
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
    await renderController();
    const onConfirm = mockAvailabilityProps.onConfirm as (intervals: unknown[]) => Promise<void>;

    await onConfirm([]);

    expect(replace).toHaveBeenCalledWith('/group/group-1');
  });
});
