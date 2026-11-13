import { act, renderHook, waitFor } from '@testing-library/react-native';

import { API_BASE_URL } from '@/constants';
import { getGroupCalendar, type CalendarDay } from '@/server/calendar';
import {
  getEventDetails,
  getEventMemories,
  type EventDetailsResponse,
  type EventMemoryResponse,
} from '@/server/events';
import {
  resolveMemoryCalendarPeriod,
  resolveMemoryImageUrl,
  sortMemorySections,
  useGroupMemories,
} from './useGroupMemories';

jest.mock('@/server/calendar', () => ({ getGroupCalendar: jest.fn() }));
jest.mock('@/server/events', () => ({
  getEventDetails: jest.fn(),
  getEventMemories: jest.fn(),
}));

const mockGetGroupCalendar = getGroupCalendar as jest.MockedFunction<typeof getGroupCalendar>;
const mockGetEventDetails = getEventDetails as jest.MockedFunction<typeof getEventDetails>;
const mockGetEventMemories = getEventMemories as jest.MockedFunction<typeof getEventMemories>;

function buildEventDetails(
  id: string,
  overrides: Partial<EventDetailsResponse> = {}
): EventDetailsResponse {
  return {
    id,
    name: 'Jantar',
    date: '2026-05-08T00:00:00.000Z',
    time: '20:00',
    image: null,
    budgetStart: null,
    budgetEnd: null,
    status: 'confirmed',
    groupId: 'group-1',
    location: {
      id: `location-${id}`,
      description: ' Rua A ',
      manuallyCreated: true,
    },
    proposal: {
      id: `proposal-${id}`,
      owner: { id: 'user-1', name: 'Ana', image: null },
      responses: [],
      createdAt: '2026-05-01T10:00:00.000Z',
    },
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
    ...overrides,
  };
}

function buildCalendarDay(date: string, overrides: Partial<CalendarDay> = {}): CalendarDay {
  return {
    date,
    scheduledEventIds: [],
    proposalIds: [],
    proposalEventIds: [],
    availableUserIds: [],
    completedEventIds: [],
    allUsersAvailable: false,
    ...overrides,
  };
}

const MEMORY: EventMemoryResponse = {
  id: 'memory-1',
  picture: '/memories/memory-1.jpg',
  eventId: 'event-1',
};

describe('useGroupMemories', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetGroupCalendar.mockResolvedValue([]);
    mockGetEventDetails.mockImplementation((eventId) =>
      Promise.resolve(buildEventDetails(eventId))
    );
    mockGetEventMemories.mockResolvedValue([]);
  });

  test('skips calendar loading when no group is provided', async () => {
    const { result } = renderHook(() => useGroupMemories({}));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sections).toEqual([]);
    expect(result.current.errorMessage).toBeNull();
    expect(mockGetGroupCalendar).not.toHaveBeenCalled();
  });

  test('loads unique events for the selected date and keeps events with memories', async () => {
    mockGetGroupCalendar.mockResolvedValue([
      buildCalendarDay('2026-05-08', {
        scheduledEventIds: ['event-1'],
        completedEventIds: ['event-1'],
        proposalEventIds: [{ proposalId: 'proposal-1', eventId: 'event-2' }],
      }),
      buildCalendarDay('2026-05-09', { scheduledEventIds: ['other-day-event'] }),
    ]);
    mockGetEventMemories.mockImplementation((eventId) =>
      Promise.resolve(eventId === 'event-1' ? [MEMORY] : [])
    );

    const { result } = renderHook(() =>
      useGroupMemories({ groupId: 'group-1', date: '2026-05-08' })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockGetGroupCalendar).toHaveBeenCalledWith('group-1', 5, 2026);
    expect(mockGetEventDetails.mock.calls.map(([eventId]) => eventId)).toEqual([
      'event-1',
      'event-2',
    ]);
    expect(result.current.sections).toEqual([
      {
        eventId: 'event-1',
        date: '2026-05-08',
        time: '20:00',
        eventName: 'Jantar',
        address: 'Rua A',
        photos: [
          {
            id: 'memory-1',
            imageUrl: `${API_BASE_URL}/api/events/event-1/memories/memory-1/image`,
          },
        ],
      },
    ]);
    expect(result.current.errorMessage).toBeNull();
  });

  test('returns successful event sections when another event request fails', async () => {
    mockGetGroupCalendar.mockResolvedValue([
      buildCalendarDay('2026-05-08', { scheduledEventIds: ['event-good', 'event-bad'] }),
    ]);
    mockGetEventDetails.mockImplementation((eventId) => {
      if (eventId === 'event-bad') return Promise.reject(new Error('event unavailable'));
      return Promise.resolve(
        buildEventDetails(eventId, {
          name: '  ',
          location: { id: 'location', description: '  ', manuallyCreated: true },
        })
      );
    });
    mockGetEventMemories.mockResolvedValue([MEMORY]);

    const { result } = renderHook(() => useGroupMemories({ groupId: 'group-1' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sections).toHaveLength(1);
    expect(result.current.sections[0]).toMatchObject({
      eventId: 'event-good',
      eventName: 'Encontro',
      address: undefined,
    });
    expect(result.current.errorMessage).toBeNull();
  });

  test('reports an error when the calendar request fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    mockGetGroupCalendar.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useGroupMemories({ groupId: 'group-1' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sections).toEqual([]);
    expect(result.current.errorMessage).toBe('Não foi possível carregar as memórias do grupo.');
    consoleError.mockRestore();
  });

  test('reports an error when every event request fails', async () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    mockGetGroupCalendar.mockResolvedValue([
      buildCalendarDay('2026-05-08', { scheduledEventIds: ['event-1'] }),
    ]);
    mockGetEventDetails.mockRejectedValue(new Error('offline'));

    const { result } = renderHook(() => useGroupMemories({ groupId: 'group-1' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.sections).toEqual([]);
    expect(result.current.errorMessage).toBe('Não foi possível carregar as memórias do grupo.');
    consoleError.mockRestore();
  });

  test('does not let an older request overwrite the latest group result', async () => {
    let resolveOldCalendar: ((days: CalendarDay[]) => void) | undefined;
    mockGetGroupCalendar.mockImplementation((groupId) =>
      groupId === 'old-group'
        ? new Promise((resolve) => {
            resolveOldCalendar = resolve;
          })
        : Promise.resolve([buildCalendarDay('2026-05-08', { scheduledEventIds: ['new-event'] })])
    );
    mockGetEventMemories.mockResolvedValue([MEMORY]);

    const { result, rerender } = renderHook(
      ({ groupId }: { groupId: string }) => useGroupMemories({ groupId }),
      { initialProps: { groupId: 'old-group' } }
    );

    rerender({ groupId: 'new-group' });
    await waitFor(() => {
      expect(result.current.sections[0]?.eventId).toBe('new-event');
    });

    act(() => {
      resolveOldCalendar?.([buildCalendarDay('2026-05-07', { scheduledEventIds: ['old-event'] })]);
    });

    expect(result.current.sections.map((section) => section.eventId)).toEqual(['new-event']);
  });

  test('ignores a stale event result after newer event loading completes', async () => {
    let resolveOldMemories: ((memories: EventMemoryResponse[]) => void) | undefined;
    mockGetGroupCalendar.mockImplementation((groupId) =>
      Promise.resolve([
        buildCalendarDay('2026-05-08', {
          scheduledEventIds: [groupId === 'old-group' ? 'old-event' : 'new-event'],
        }),
      ])
    );
    mockGetEventMemories.mockImplementation((eventId) =>
      eventId === 'old-event'
        ? new Promise((resolve) => {
            resolveOldMemories = resolve;
          })
        : Promise.resolve([MEMORY])
    );

    const { result, rerender } = renderHook(
      ({ groupId }: { groupId: string }) => useGroupMemories({ groupId }),
      { initialProps: { groupId: 'old-group' } }
    );

    await waitFor(() => {
      expect(resolveOldMemories).toBeDefined();
    });
    rerender({ groupId: 'new-group' });
    await waitFor(() => {
      expect(result.current.sections[0]?.eventId).toBe('new-event');
    });

    act(() => {
      resolveOldMemories?.([MEMORY]);
    });

    expect(result.current.sections.map((section) => section.eventId)).toEqual(['new-event']);
  });

  test('does not expose errors from a stale event request', async () => {
    let rejectOldDetails: ((error: Error) => void) | undefined;
    mockGetGroupCalendar.mockImplementation((groupId) =>
      Promise.resolve([
        buildCalendarDay('2026-05-08', {
          scheduledEventIds: [groupId === 'old-group' ? 'old-event' : 'new-event'],
        }),
      ])
    );
    mockGetEventDetails.mockImplementation((eventId) =>
      eventId === 'old-event'
        ? new Promise((_, reject) => {
            rejectOldDetails = reject;
          })
        : Promise.resolve(buildEventDetails(eventId))
    );
    mockGetEventMemories.mockResolvedValue([MEMORY]);

    const consoleError = jest.spyOn(console, 'error').mockImplementation(jest.fn());
    const { result, rerender } = renderHook(
      ({ groupId }: { groupId: string }) => useGroupMemories({ groupId }),
      { initialProps: { groupId: 'old-group' } }
    );

    await waitFor(() => {
      expect(rejectOldDetails).toBeDefined();
    });
    rerender({ groupId: 'new-group' });
    await waitFor(() => {
      expect(result.current.sections[0]?.eventId).toBe('new-event');
    });

    act(() => {
      rejectOldDetails?.(new Error('stale failure'));
    });

    expect(result.current.errorMessage).toBeNull();
    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});

describe('memory gallery helpers', () => {
  test.each([
    ['https://cdn.alibe.com/photo.jpg', 'https://cdn.alibe.com/photo.jpg'],
    ['file:///tmp/photo.jpg', 'file:///tmp/photo.jpg'],
    ['data:image/png;base64,abc', 'data:image/png;base64,abc'],
    ['/memories/photo.jpg', `${API_BASE_URL}/memories/photo.jpg`],
    ['memories/photo.jpg', `${API_BASE_URL}/memories/photo.jpg`],
  ])('resolves image path %s', (input, expected) => {
    expect(resolveMemoryImageUrl(input)).toBe(expected);
  });

  test('uses the selected date as the calendar period when valid', () => {
    expect(resolveMemoryCalendarPeriod('2026-05-08', '9', '2025')).toEqual({
      month: 5,
      year: 2026,
      selectedDate: '2026-05-08',
    });
  });

  test('sorts matching selected-date sections first without mutating input', () => {
    const sections = [
      { eventId: 'later', date: '2026-05-09', eventName: 'Later', photos: [] },
      { eventId: 'selected', date: '2026-05-08', eventName: 'Selected', photos: [] },
    ];

    expect(sortMemorySections(sections, '2026-05-08').map(({ eventId }) => eventId)).toEqual([
      'selected',
      'later',
    ]);
    expect(sections[0].eventId).toBe('later');
  });

  test('sorts by descending date, then descending time', () => {
    const sections = [
      { eventId: 'early', date: '2026-05-08', time: '10:00', eventName: 'Early', photos: [] },
      { eventId: 'newest-date', date: '2026-05-09', eventName: 'Newest', photos: [] },
      { eventId: 'late', date: '2026-05-08', time: '20:00', eventName: 'Late', photos: [] },
    ];

    expect(sortMemorySections(sections).map(({ eventId }) => eventId)).toEqual([
      'newest-date',
      'late',
      'early',
    ]);
  });
});
