import { API_BASE_URL } from '@/constants';
import type { MemoriesScreenProps } from '@/screens/Memories';
import { getGroupCalendar, type CalendarDay } from '@/server/calendar';
import { getEventMemories, type EventMemoryResponse } from '@/server/events';
import { act, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MemoriesController, { getDayEventIds } from './controller';

let mockScreenProps: MemoriesScreenProps | null = null;
let mockFocusCallback: (() => void) | null = null;

jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual<typeof import('react')>('react');
  return {
    useFocusEffect: (callback: import('react').EffectCallback) => {
      mockFocusCallback = callback;
      useEffect(callback, [callback]);
    },
    useLocalSearchParams: jest.fn(),
    useRouter: jest.fn(),
  };
});

jest.mock('@/server/calendar', () => ({
  getGroupCalendar: jest.fn(),
}));

jest.mock('@/server/auth', () => ({
  authenticatedFetch: jest.fn(),
}));

jest.mock('@/server/events', () => {
  const { getMemoryImageUrl } =
    jest.requireActual<typeof import('@/server/events')>('@/server/events');
  return {
    getEventMemories: jest.fn(),
    getMemoryImageUrl,
  };
});

jest.mock('@/screens/Memories', () => ({
  MemoriesScreen: (props: MemoriesScreenProps) => {
    mockScreenProps = props;
    return null;
  },
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetGroupCalendar = getGroupCalendar as jest.MockedFunction<typeof getGroupCalendar>;
const mockGetEventMemories = getEventMemories as jest.MockedFunction<typeof getEventMemories>;

function screenProps(): MemoriesScreenProps {
  if (!mockScreenProps) {
    throw new Error('MemoriesScreen was not rendered');
  }
  return mockScreenProps;
}

const MAY_CALENDAR_DAYS: CalendarDay[] = [
  {
    date: '2026-05-08',
    scheduledEventIds: ['event-2'],
    completedEventIds: ['event-1'],
    proposalIds: [],
    proposalEventIds: [],
    availableUserIds: [],
    allUsersAvailable: false,
  },
  {
    date: '2026-05-10',
    scheduledEventIds: ['event-no-memories'],
    completedEventIds: [],
    proposalIds: [],
    proposalEventIds: [],
    availableUserIds: [],
    allUsersAvailable: false,
  },
  {
    date: '2026-05-11',
    scheduledEventIds: [],
    completedEventIds: [],
    proposalIds: ['prop-1'],
    proposalEventIds: [{ proposalId: 'prop-1', eventId: 'event-3' }],
    availableUserIds: [],
    allUsersAvailable: false,
  },
  {
    date: '2026-05-12',
    scheduledEventIds: [],
    completedEventIds: [],
    proposalIds: [],
    proposalEventIds: [],
    availableUserIds: ['user-1'],
    allUsersAvailable: true,
  },
];

const MEMORIES_BY_EVENT: Record<string, EventMemoryResponse[]> = {
  'event-1': [
    {
      id: 'mem-1',
      picture: '/memories/mem-1/images/photo-1.jpg',
      eventId: 'event-1',
    },
    {
      id: 'mem-2',
      picture: '/memories/mem-2/images/photo-2.jpg',
      eventId: 'event-1',
    },
  ],
  'event-2': [
    {
      id: 'mem-3',
      picture: '/memories/mem-3/images/photo-3.png',
      eventId: 'event-2',
    },
  ],
  'event-no-memories': [],
  'event-3': [
    {
      id: 'mem-4',
      picture: '/memories/mem-4/images/photo-4.jpg',
      eventId: 'event-3',
    },
  ],
};

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  let reject: (reason: unknown) => void = () => undefined;
  const promise = new Promise<T>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });

  return { promise, resolve, reject };
}

async function renderLoaded() {
  await Promise.resolve(render(<MemoriesController />));
  await waitFor(() => {
    expect(screenProps().isLoading).toBe(false);
  });
}

describe('getDayEventIds', () => {
  test('deduplicates event IDs of a day', () => {
    const ids = getDayEventIds({
      date: '2026-05-08',
      completedEventIds: ['e1', 'e2'],
      scheduledEventIds: ['e2', 'e3'],
      proposalIds: ['p1'],
      proposalEventIds: [{ proposalId: 'p1', eventId: 'e4' }],
      availableUserIds: [],
      allUsersAvailable: false,
    });

    expect(ids).toEqual(['e1', 'e2', 'e3', 'e4']);
  });

  test('handles days without proposal events', () => {
    const ids = getDayEventIds({
      date: '2026-05-08',
      completedEventIds: ['e1'],
      scheduledEventIds: [],
      proposalIds: [],
      availableUserIds: [],
      allUsersAvailable: false,
    });

    expect(ids).toEqual(['e1']);
  });
});

describe('MemoriesController', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockScreenProps = null;
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1' });
    mockUseRouter.mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
    mockGetGroupCalendar.mockResolvedValue(MAY_CALENDAR_DAYS);
    mockGetEventMemories.mockImplementation((eventId: string) =>
      Promise.resolve(MEMORIES_BY_EVENT[eventId] ?? [])
    );
  });

  test('marks days that have memories with the first image', async () => {
    await renderLoaded();

    const now = new Date();
    expect(mockGetGroupCalendar).toHaveBeenCalledWith(
      'group-1',
      now.getMonth() + 1,
      now.getFullYear()
    );
    expect(mockGetEventMemories).toHaveBeenCalledWith('event-1');
    expect(mockGetEventMemories).toHaveBeenCalledWith('event-2');
    expect(mockGetEventMemories).toHaveBeenCalledWith('event-no-memories');
    expect(mockGetEventMemories).toHaveBeenCalledWith('event-3');

    const { dayMarks } = screenProps();
    expect(dayMarks['2026-05-08']).toEqual({
      status: 'realized',
      eventIds: ['event-1', 'event-2'],
      memoryIds: ['mem-1', 'mem-2', 'mem-3'],
      imageUrl: `${API_BASE_URL}/api/events/event-1/memories/mem-1/image`,
    });
    expect(dayMarks['2026-05-11']).toEqual({
      status: 'realized',
      eventIds: ['event-3'],
      memoryIds: ['mem-4'],
      imageUrl: `${API_BASE_URL}/api/events/event-3/memories/mem-4/image`,
    });
    expect(dayMarks['2026-05-10']).toBeUndefined();
    expect(dayMarks['2026-05-12']).toBeUndefined();
  });

  test('fetches the new month days when the calendar header changes month', async () => {
    await renderLoaded();

    await act(async () => {
      screenProps().onMonthChange('2026-06-01');
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(mockGetGroupCalendar).toHaveBeenCalledWith('group-1', 6, 2026);
    });
  });

  test('opens the gallery of the pressed day', async () => {
    await renderLoaded();

    screenProps().onDayPress('2026-05-08');

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/memories/gallery',
      params: { id: 'group-1', date: '2026-05-08' },
    });
  });

  test('opens the gallery of the visible month on "Ver todas"', async () => {
    await renderLoaded();

    await act(async () => {
      screenProps().onMonthChange('2026-05-01');
      await Promise.resolve();
    });

    screenProps().onSeeAllPress();

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/memories/gallery',
      params: {
        id: 'group-1',
        month: '5',
        year: '2026',
      },
    });
  });

  test('opens the new memory screen for the visible month', async () => {
    await renderLoaded();

    await act(async () => {
      screenProps().onMonthChange('2026-10-01');
      await Promise.resolve();
    });

    screenProps().onAddMemory();

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/memories/new',
      params: { id: 'group-1', month: '10', year: '2026' },
    });
  });

  test('sets an error message when loading fails and retries on demand', async () => {
    mockGetGroupCalendar.mockRejectedValueOnce(new Error('Network error'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await renderLoaded();

    expect(screenProps().errorMessage).toBe('Não foi possível carregar as memórias do calendário.');

    mockGetGroupCalendar.mockResolvedValueOnce(MAY_CALENDAR_DAYS);

    await act(async () => {
      screenProps().onRetry?.();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screenProps().errorMessage).toBeNull();
      expect(Object.keys(screenProps().dayMarks)).toEqual(['2026-05-08', '2026-05-11']);
    });
  });

  test('reloads the calendar when the screen is focused again', async () => {
    mockGetGroupCalendar.mockResolvedValueOnce([]);

    await renderLoaded();
    expect(screenProps().dayMarks).toEqual({});

    await act(async () => {
      mockFocusCallback?.();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(Object.keys(screenProps().dayMarks)).toEqual(['2026-05-08', '2026-05-11']);
    });
    expect(mockGetGroupCalendar).toHaveBeenCalledTimes(2);
  });

  test('renders nothing and skips loading when there is no group', async () => {
    mockUseLocalSearchParams.mockReturnValue({});

    await Promise.resolve(render(<MemoriesController />));

    expect(mockScreenProps).toBeNull();
    expect(mockGetGroupCalendar).not.toHaveBeenCalled();
  });

  test('keeps the other days when the memories of one event fail to load', async () => {
    mockGetEventMemories.mockImplementation((eventId: string) =>
      eventId === 'event-3'
        ? Promise.reject(new Error('Network error'))
        : Promise.resolve(MEMORIES_BY_EVENT[eventId] ?? [])
    );

    await renderLoaded();

    expect(screenProps().errorMessage).toBeNull();
    expect(Object.keys(screenProps().dayMarks)).toEqual(['2026-05-08']);
  });

  test('ignores an invalid month from the calendar header', async () => {
    await renderLoaded();

    await act(async () => {
      screenProps().onMonthChange('invalid-date');
      await Promise.resolve();
    });

    expect(mockGetGroupCalendar).toHaveBeenCalledTimes(1);
  });

  describe('when the month changes before the previous request finishes', () => {
    async function renderAndChangeMonth() {
      await Promise.resolve(render(<MemoriesController />));

      await act(async () => {
        screenProps().onMonthChange('2026-06-01');
        await Promise.resolve();
      });

      await waitFor(() => {
        expect(screenProps().isLoading).toBe(false);
      });
    }

    test('ignores the previous month days', async () => {
      const previousMonth = deferred<CalendarDay[]>();
      mockGetGroupCalendar.mockReturnValueOnce(previousMonth.promise).mockResolvedValueOnce([]);

      await renderAndChangeMonth();

      await act(async () => {
        previousMonth.resolve(MAY_CALENDAR_DAYS);
        await Promise.resolve();
      });

      expect(mockGetEventMemories).not.toHaveBeenCalled();
      expect(screenProps().dayMarks).toEqual({});
    });

    test('ignores the previous month memories', async () => {
      const previousMemories = deferred<EventMemoryResponse[]>();
      mockGetGroupCalendar.mockResolvedValueOnce([MAY_CALENDAR_DAYS[2]]).mockResolvedValueOnce([]);
      mockGetEventMemories.mockReturnValueOnce(previousMemories.promise);

      await Promise.resolve(render(<MemoriesController />));
      await waitFor(() => {
        expect(mockGetEventMemories).toHaveBeenCalledWith('event-3');
      });

      await act(async () => {
        screenProps().onMonthChange('2026-06-01');
        await Promise.resolve();
      });
      await waitFor(() => {
        expect(screenProps().isLoading).toBe(false);
      });

      await act(async () => {
        previousMemories.resolve(MEMORIES_BY_EVENT['event-3']);
        await Promise.resolve();
      });

      expect(screenProps().dayMarks).toEqual({});
    });

    test('ignores the previous month error', async () => {
      const previousMonth = deferred<CalendarDay[]>();
      mockGetGroupCalendar.mockReturnValueOnce(previousMonth.promise).mockResolvedValueOnce([]);
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);

      await renderAndChangeMonth();

      await act(async () => {
        previousMonth.reject(new Error('Network error'));
        await Promise.resolve();
      });

      expect(screenProps().errorMessage).toBeNull();
      expect(consoleError).not.toHaveBeenCalled();
    });
  });
});
