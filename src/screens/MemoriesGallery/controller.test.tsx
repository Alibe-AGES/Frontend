import { API_BASE_URL } from '@/constants';
import type { MemoriesGalleryScreenProps } from '@/screens/MemoriesGallery';
import { getGroupCalendar, type CalendarDay } from '@/server/calendar';
import {
  getEventDetails,
  getEventMemories,
  type EventDetailsResponse,
  type EventMemoryResponse,
} from '@/server/events';
import { act, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MemoriesGalleryController, { sortMemorySections } from './controller';

let mockScreenProps: MemoriesGalleryScreenProps | null = null;

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

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
    getEventDetails: jest.fn(),
    getEventMemories: jest.fn(),
    getMemoryImageUrl,
  };
});

jest.mock('@/screens/MemoriesGallery', () => ({
  MemoriesGalleryScreen: (props: MemoriesGalleryScreenProps) => {
    mockScreenProps = props;
    return null;
  },
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetGroupCalendar = getGroupCalendar as jest.MockedFunction<typeof getGroupCalendar>;
const mockGetEventDetails = getEventDetails as jest.MockedFunction<typeof getEventDetails>;
const mockGetEventMemories = getEventMemories as jest.MockedFunction<typeof getEventMemories>;

function screenProps(): MemoriesGalleryScreenProps {
  if (!mockScreenProps) {
    throw new Error('MemoriesGalleryScreen was not rendered');
  }
  return mockScreenProps;
}

function buildEventDetails(
  id: string,
  name: string,
  date: string,
  time = '20:00',
  locationDescription = 'Rua dos Andradas, 100'
): EventDetailsResponse {
  return {
    id,
    name,
    date,
    time,
    image: null,
    budgetStart: null,
    budgetEnd: null,
    status: 'confirmed',
    groupId: 'group-1',
    location: {
      id: `loc-${id}`,
      description: locationDescription,
      manuallyCreated: true,
    },
    proposal: {
      id: `prop-${id}`,
      owner: { id: 'user-1', name: 'Ana', image: null },
      responses: [],
      createdAt: '2026-05-01T10:00:00.000Z',
    },
    createdAt: '2026-05-01T10:00:00.000Z',
    updatedAt: '2026-05-01T10:00:00.000Z',
  };
}

const CALENDAR_DAYS: CalendarDay[] = [
  {
    date: '2026-05-08',
    scheduledEventIds: ['event-same-day-early'],
    completedEventIds: ['event-same-day-late'],
    proposalIds: [],
    proposalEventIds: [],
    availableUserIds: [],
    allUsersAvailable: false,
  },
  {
    date: '2026-05-10',
    scheduledEventIds: ['event-without-memories'],
    completedEventIds: [],
    proposalIds: [],
    proposalEventIds: [],
    availableUserIds: [],
    allUsersAvailable: false,
  },
  {
    date: '2026-05-11',
    scheduledEventIds: [],
    completedEventIds: ['event-most-recent'],
    proposalIds: [],
    proposalEventIds: [],
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

const EVENTS_BY_ID: Record<string, EventDetailsResponse> = {
  'event-same-day-early': buildEventDetails(
    'event-same-day-early',
    'Almoço no Centro',
    '2026-05-08',
    '12:00'
  ),
  'event-same-day-late': buildEventDetails(
    'event-same-day-late',
    'Restaurante Giozakaya',
    '2026-05-08',
    '20:30'
  ),
  'event-without-memories': buildEventDetails(
    'event-without-memories',
    'Café sem Fotos',
    '2026-05-10',
    '16:00'
  ),
  'event-most-recent': buildEventDetails(
    'event-most-recent',
    'Mercado Brasco',
    '2026-05-11',
    '10:00'
  ),
};

const MEMORIES_BY_EVENT_ID: Record<string, EventMemoryResponse[]> = {
  'event-same-day-early': [
    {
      id: 'mem-1',
      picture: '/memories/mem-1/images/photo-1.jpg',
      eventId: 'event-same-day-early',
    },
  ],
  'event-same-day-late': [
    {
      id: 'mem-2',
      picture: '/memories/mem-2/images/photo-2.jpg',
      eventId: 'event-same-day-late',
    },
    {
      id: 'mem-3',
      picture: '/memories/mem-3/images/photo-3.png',
      eventId: 'event-same-day-late',
    },
  ],
  'event-without-memories': [],
  'event-most-recent': [
    {
      id: 'mem-4',
      picture: '/memories/mem-4/images/photo-4.jpg',
      eventId: 'event-most-recent',
    },
  ],
};

async function renderLoaded() {
  await Promise.resolve(render(<MemoriesGalleryController />));
  await waitFor(() => {
    expect(screenProps().isLoading).toBe(false);
  });
}

describe('sortMemorySections', () => {
  test('orders events from most recent to oldest by default', () => {
    const sorted = sortMemorySections([
      {
        eventId: 'e1',
        date: '2026-05-08',
        time: '12:00',
        eventName: 'Almoço',
        photos: [],
      },
      {
        eventId: 'e2',
        date: '2026-05-11',
        time: '09:00',
        eventName: 'Café',
        photos: [],
      },
      {
        eventId: 'e3',
        date: '2026-05-08',
        time: '20:00',
        eventName: 'Jantar',
        photos: [],
      },
    ]);

    expect(sorted.map((item) => item.eventId)).toEqual(['e2', 'e3', 'e1']);
  });

  test('places the selected date first when a specific date is provided', () => {
    const sorted = sortMemorySections(
      [
        {
          eventId: 'e1',
          date: '2026-05-08',
          time: '12:00',
          eventName: 'Almoço',
          photos: [],
        },
        {
          eventId: 'e2',
          date: '2026-05-11',
          time: '09:00',
          eventName: 'Café',
          photos: [],
        },
      ],
      '2026-05-08'
    );

    expect(sorted.map((item) => item.eventId)).toEqual(['e1', 'e2']);
  });
});

describe('MemoriesGalleryController', () => {
  const push = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockScreenProps = null;
    mockUseLocalSearchParams.mockReturnValue({
      id: 'group-1',
      month: '5',
      year: '2026',
    });
    mockUseRouter.mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
    mockGetGroupCalendar.mockResolvedValue(CALENDAR_DAYS);
    mockGetEventDetails.mockImplementation((eventId: string) =>
      Promise.resolve(EVENTS_BY_ID[eventId])
    );
    mockGetEventMemories.mockImplementation((eventId: string) =>
      Promise.resolve(MEMORIES_BY_EVENT_ID[eventId] ?? [])
    );
  });

  test('fetches calendar days, events and memories, showing only events with memories ordered from most recent', async () => {
    await renderLoaded();

    expect(mockGetGroupCalendar).toHaveBeenCalledWith('group-1', 5, 2026);
    expect(mockGetEventDetails).toHaveBeenCalledTimes(4);
    expect(mockGetEventMemories).toHaveBeenCalledTimes(4);

    const { sections } = screenProps();
    expect(sections.map((section) => section.eventId)).toEqual([
      'event-most-recent',
      'event-same-day-late',
      'event-same-day-early',
    ]);

    expect(sections[0]?.photos).toEqual([
      {
        id: 'mem-4',
        imageUrl: `${API_BASE_URL}/api/events/event-most-recent/memories/mem-4/image`,
      },
    ]);
    expect(sections[1]?.photos).toEqual([
      {
        id: 'mem-2',
        imageUrl: `${API_BASE_URL}/api/events/event-same-day-late/memories/mem-2/image`,
      },
      {
        id: 'mem-3',
        imageUrl: `${API_BASE_URL}/api/events/event-same-day-late/memories/mem-3/image`,
      },
    ]);
    expect(sections[2]?.photos).toEqual([
      {
        id: 'mem-1',
        imageUrl: `${API_BASE_URL}/api/events/event-same-day-early/memories/mem-1/image`,
      },
    ]);
  });

  test('prioritizes events of the chosen day when a specific date parameter is passed', async () => {
    mockUseLocalSearchParams.mockReturnValue({
      id: 'group-1',
      date: '2026-05-08',
    });

    await renderLoaded();

    expect(mockGetGroupCalendar).toHaveBeenCalledWith('group-1', 5, 2026);
    expect(screenProps().sections.map((section) => section.eventId)).toEqual([
      'event-same-day-late',
      'event-same-day-early',
      'event-most-recent',
    ]);
  });

  test('opens the carousel on the tapped photo keeping the period params', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1', month: '9', year: '2026' });
    mockGetGroupCalendar.mockResolvedValue([]);

    await render(<MemoriesGalleryController />);
    await waitFor(() => {
      expect(screenProps().isLoading).toBe(false);
    });

    screenProps().onPhotoPress?.('photo-7');

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/memories/carousel',
      params: { id: 'group-1', photoId: 'photo-7', month: '9', year: '2026' },
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

    expect(screenProps().errorMessage).toBe('Não foi possível carregar as memórias do grupo.');

    mockGetGroupCalendar.mockResolvedValueOnce(CALENDAR_DAYS);

    await act(async () => {
      screenProps().onRetry();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screenProps().errorMessage).toBeNull();
      expect(screenProps().sections).toHaveLength(3);
    });
  });

  test('keeps the other events when one of them fails to load', async () => {
    mockGetEventMemories.mockImplementation((eventId: string) =>
      eventId === 'event-same-day-late'
        ? Promise.reject(new Error('Network error'))
        : Promise.resolve(MEMORIES_BY_EVENT_ID[eventId] ?? [])
    );

    await renderLoaded();

    expect(screenProps().errorMessage).toBeNull();
    expect(screenProps().sections.map((section) => section.eventId)).toEqual([
      'event-most-recent',
      'event-same-day-early',
    ]);
  });

  test('sets an error message when every event fails to load', async () => {
    mockGetEventMemories.mockRejectedValue(new Error('Network error'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await renderLoaded();

    expect(screenProps().errorMessage).toBe('Não foi possível carregar as memórias do grupo.');
    expect(screenProps().sections).toEqual([]);
  });
});
