import { API_BASE_URL } from '@/constants';
import type { MemoriesScreenProps } from '@/screens/Memories';
import { getGroupCalendar, type CalendarDay } from '@/server/calendar';
import { getEventMemories, type EventMemoryResponse } from '@/server/events';
import { act, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MemoriesController, { getDayEventIds, resolveMemoryImageUrl } from './controller';

let mockScreenProps: MemoriesScreenProps | null = null;

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/server/calendar', () => ({
  getGroupCalendar: jest.fn(),
}));

jest.mock('@/server/events', () => ({
  getEventMemories: jest.fn(),
}));

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
      picture: 'api/events/event-1/memories/mem-1/image',
      eventId: 'event-1',
    },
    {
      id: 'mem-2',
      picture: 'api/events/event-1/memories/mem-2/image',
      eventId: 'event-1',
    },
  ],
  'event-2': [
    {
      id: 'mem-3',
      picture: 'https://cdn.alibe.com/mem-3.jpg',
      eventId: 'event-2',
    },
  ],
  'event-no-memories': [],
  'event-3': [
    {
      id: 'mem-4',
      picture: '/api/events/event-3/memories/mem-4/image',
      eventId: 'event-3',
    },
  ],
};

async function renderLoaded() {
  await Promise.resolve(render(<MemoriesController />));
  await waitFor(() => {
    expect(screenProps().isLoading).toBe(false);
  });
}

describe('resolveMemoryImageUrl', () => {
  test('prefixes relative paths with API_BASE_URL and preserves absolute URLs', () => {
    expect(resolveMemoryImageUrl('api/events/e1/memories/m1/image')).toBe(
      `${API_BASE_URL}/api/events/e1/memories/m1/image`
    );
    expect(resolveMemoryImageUrl('/api/events/e1/memories/m1/image')).toBe(
      `${API_BASE_URL}/api/events/e1/memories/m1/image`
    );
    expect(resolveMemoryImageUrl('https://cdn.alibe.com/photo.jpg')).toBe(
      'https://cdn.alibe.com/photo.jpg'
    );
  });
});

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

  test('navigates to new memory screen when onAddMemory is triggered', async () => {
    await renderLoaded();

    screenProps().onAddMemory();

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/memories/new',
      params: { id: 'group-1' },
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
});
