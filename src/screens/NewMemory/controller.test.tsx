import { act, render, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';

import { getGroupCalendar } from '@/server/calendar';
import { getEventDetails } from '@/server/events';
import { createMemory } from '@/server/memories';
import NewMemoryController from './controller';
import type { NewMemoryScreenProps } from '.';

let mockScreenProps: NewMemoryScreenProps | null = null;
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: 'group-1' }),
  useRouter: () => ({
    back: jest.fn(),
    replace: mockReplace,
    canGoBack: () => true,
  }),
}));

jest.mock('@/server/calendar', () => ({ getGroupCalendar: jest.fn() }));
jest.mock('@/server/events', () => ({ getEventDetails: jest.fn() }));
jest.mock('@/server/memories', () => ({ createMemory: jest.fn() }));
jest.mock('react-native-toast-message', () => ({ __esModule: true, default: { show: jest.fn() } }));

jest.mock('.', () => ({
  NewMemoryScreen: (props: NewMemoryScreenProps) => {
    mockScreenProps = props;
    return null;
  },
}));

const mockedCalendar = jest.mocked(getGroupCalendar);
const mockedEventDetails = jest.mocked(getEventDetails);
const PHOTO = { uri: 'file:///memory.jpg' };

function calendarDay(completedEventIds: string[]) {
  return {
    date: '2026-11-01',
    scheduledEventIds: [],
    proposalIds: [],
    availableUserIds: [],
    completedEventIds,
    allUsersAvailable: false,
  };
}

function eventDetails(id: string, name: string | null) {
  return { id, name } as Awaited<ReturnType<typeof getEventDetails>>;
}

describe('<NewMemoryController />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockScreenProps = null;
  });

  test('lists the completed events of the group without repeating them', async () => {
    mockedCalendar.mockResolvedValue([
      calendarDay(['event-1']),
      calendarDay(['event-1', 'event-2']),
    ]);
    mockedEventDetails.mockImplementation((eventId: string) =>
      Promise.resolve(eventDetails(eventId, eventId === 'event-1' ? 'Churrasco' : 'Jantar'))
    );

    await render(<NewMemoryController />);

    await waitFor(() => {
      expect(mockScreenProps?.isLoadingEvents).toBe(false);
    });

    expect(mockedCalendar).toHaveBeenCalledWith('group-1', expect.any(Number), expect.any(Number));
    expect(mockedEventDetails).toHaveBeenCalledTimes(2);
    expect(mockScreenProps?.events).toEqual([
      { label: 'Churrasco', value: 'event-1' },
      { label: 'Jantar', value: 'event-2' },
    ]);
    expect(mockScreenProps?.error).toBeNull();
  });

  test('falls back to a placeholder label when the event has no name', async () => {
    mockedCalendar.mockResolvedValue([calendarDay(['event-1'])]);
    mockedEventDetails.mockResolvedValue(eventDetails('event-1', null));

    await render(<NewMemoryController />);

    await waitFor(() => {
      expect(mockScreenProps?.events).toEqual([{ label: 'Evento sem nome', value: 'event-1' }]);
    });
  });

  test('shows an error when the events cannot be loaded', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockedCalendar.mockRejectedValue(new Error('offline'));

    await render(<NewMemoryController />);

    await waitFor(() => {
      expect(mockScreenProps?.error).toBe('Não foi possível carregar os eventos.');
    });

    expect(mockScreenProps?.events).toEqual([]);
    expect(mockScreenProps?.isLoadingEvents).toBe(false);

    mockedCalendar.mockResolvedValue([calendarDay(['event-1'])]);
    mockedEventDetails.mockResolvedValue(eventDetails('event-1', 'Churrasco'));

    await act(() => {
      mockScreenProps?.onRetry();
    });

    await waitFor(() => {
      expect(mockScreenProps?.events).toEqual([{ label: 'Churrasco', value: 'event-1' }]);
    });
    expect(mockScreenProps?.error).toBeNull();
  });

  async function fillForm() {
    mockedCalendar.mockResolvedValue([calendarDay(['event-1'])]);
    mockedEventDetails.mockResolvedValue(eventDetails('event-1', 'Churrasco'));

    await render(<NewMemoryController />);

    await waitFor(() => {
      expect(mockScreenProps?.isLoadingEvents).toBe(false);
    });

    await act(() => {
      mockScreenProps?.onSelectEvent('event-1');
      mockScreenProps?.onPhotoSelected(PHOTO);
    });
  }

  test('creates the memory and opens the confirmation screen', async () => {
    jest.mocked(createMemory).mockResolvedValue();
    await fillForm();

    await act(() => {
      mockScreenProps?.onCreate();
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith({
        pathname: '/group/[id]/memories/created',
        params: { id: 'group-1' },
      });
    });
    expect(createMemory).toHaveBeenCalledWith('event-1', PHOTO);
  });

  test('stays on the screen and warns when the memory cannot be created', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(createMemory).mockRejectedValue(new Error('offline'));
    await fillForm();

    await act(() => {
      mockScreenProps?.onCreate();
    });

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledTimes(1);
    });
    expect(mockReplace).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(mockScreenProps?.isSubmitting).toBe(false);
    });
  });
});
