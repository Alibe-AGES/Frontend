import { getGroupCalendar } from '@/server/calendar';
import { EventDetailsResponse, getEventDetails, respondToEventProposal } from '@/server/events';
import { getGroupMembers, getMe } from '@/server/groups';
import { getStoredLocationDetails, type PlaceDetails } from '@/server/places';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import DayController from './controller';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/server/calendar', () => ({
  getGroupCalendar: jest.fn(),
}));

jest.mock('@/server/events', () => ({
  getEventDetails: jest.fn(),
  respondToEventProposal: jest.fn(),
}));

jest.mock('@/server/groups', () => ({
  getGroupMembers: jest.fn(),
  getMe: jest.fn(),
}));

jest.mock('@/server/places', () => ({
  getStoredLocationDetails: jest.fn(),
}));

jest.mock('@/components/BackButton', () => ({
  BackButton: () => null,
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetGroupCalendar = getGroupCalendar as jest.MockedFunction<typeof getGroupCalendar>;
const mockGetEventDetails = getEventDetails as jest.MockedFunction<typeof getEventDetails>;
const mockRespondToEventProposal = respondToEventProposal as jest.MockedFunction<
  typeof respondToEventProposal
>;
const mockGetGroupMembers = getGroupMembers as jest.MockedFunction<typeof getGroupMembers>;
const mockGetMe = getMe as jest.MockedFunction<typeof getMe>;
const mockGetStoredLocationDetails = jest.mocked(getStoredLocationDetails);

function storedLocation(address: string | null): PlaceDetails {
  return {
    externalId: null,
    name: 'Local',
    imageUrl: null,
    description: null,
    address,
    rating: null,
    priceRange: null,
    phoneNumber: null,
    website: null,
    openingHours: [],
  };
}

describe('DayController', () => {
  const push = jest.fn();

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1', date: '2026-10-12' });
    mockUseRouter.mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
    mockGetMe.mockResolvedValue({ id: 'user-3', name: 'Kata', profilePic: null });
    mockGetGroupMembers.mockResolvedValue([
      { id: 'user-1', name: 'Ana', profilePic: null },
      { id: 'user-2', name: 'Bia', profilePic: null },
      { id: 'user-3', name: 'Kata', profilePic: null },
    ]);
    mockGetGroupCalendar.mockResolvedValue([
      {
        date: '2026-10-12',
        scheduledEventIds: ['event-1'],
        proposalIds: ['proposal-2'],
        proposalEventIds: [{ proposalId: 'proposal-2', eventId: 'event-2' }],
        availableUserIds: [],
        completedEventIds: [],
        allUsersAvailable: false,
      },
    ]);
    // event-2 is at a place matched from a custom suggestion: its address lives on the location.
    // event-1's lookup fails, so it keeps the address typed into the description.
    mockGetStoredLocationDetails.mockImplementation((locationId) =>
      locationId === 'location-event-2'
        ? Promise.resolve(storedLocation('Rua das Flores, 123'))
        : Promise.reject(new Error('not found'))
    );
    mockGetEventDetails.mockImplementation((eventId) =>
      Promise.resolve({
        id: eventId,
        name: eventId === 'event-1' ? 'Bloom Café' : 'Cinema',
        date: '2026-10-12',
        time: '18:30',
        image: null,
        budgetStart: null,
        budgetEnd: null,
        status: 'pending',
        groupId: 'group-1',
        location: {
          id: `location-${eventId}`,
          description: 'Av. Carlos Gomes, 600',
          manuallyCreated: true,
        },
        proposal: {
          id: eventId === 'event-1' ? 'proposal-1' : 'proposal-2',
          owner: { id: 'user-1', name: 'Ana', image: null },
          responses: [
            {
              id: 'response-1',
              answer: 'yes',
              createdAt: '2026-10-01T12:00:00.000Z',
              user: { id: 'user-2', name: 'Bia', image: null },
            },
          ],
          createdAt: '2026-10-01T12:00:00.000Z',
        },
        createdAt: '2026-10-01T12:00:00.000Z',
        updatedAt: '2026-10-01T12:00:00.000Z',
      } satisfies EventDetailsResponse)
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads the events of the day in the carousel', async () => {
    const { getAllByText, getByText, getByTestId, queryByTestId } = await Promise.resolve(
      render(<DayController />)
    );

    // Only a centered spinner while the day loads, without the carousel.
    expect(getByTestId('group-day-loading')).toBeTruthy();
    expect(queryByTestId('group-day-carousel')).toBeNull();

    await waitFor(() => {
      expect(mockGetGroupCalendar).toHaveBeenCalledWith('group-1', 10, 2026);
      expect(mockGetEventDetails).toHaveBeenCalledWith('event-1');
      expect(mockGetEventDetails).toHaveBeenCalledWith('event-2');
      expect(getByText('Bloom Café')).toBeTruthy();
      expect(getByText('Cinema')).toBeTruthy();
      expect(getByText('Av. Carlos Gomes, 600')).toBeTruthy();
      expect(getByText('Rua das Flores, 123')).toBeTruthy();
      expect(mockGetStoredLocationDetails).toHaveBeenCalledWith('location-event-1');
      expect(mockGetStoredLocationDetails).toHaveBeenCalledWith('location-event-2');
      expect(getAllByText('Status dos participantes')).toHaveLength(2);
      expect(getAllByText('Eu')).toHaveLength(2);
      expect(getAllByText('Bia')).toHaveLength(2);
      // Ana proposed both events: once in the owner highlight and once among the avatars.
      expect(getAllByText('Proposto por')).toHaveLength(2);
      expect(getAllByText('Ana')).toHaveLength(4);
      expect(getAllByText('Confirmar presença')).toHaveLength(2);
      expect(getAllByText('Cancelar presença')).toHaveLength(2);
      expect(getByText('1 / 2')).toBeTruthy();
    });

    fireEvent.press(getByTestId('group-day-carousel-next'));
    await Promise.resolve();
    expect(getByText('2 / 2')).toBeTruthy();

    fireEvent.press(getByTestId('group-day-carousel-presence-yes-event-2'));
    await Promise.resolve();
    await waitFor(() => {
      expect(mockRespondToEventProposal).toHaveBeenCalledWith('event-2', 'yes', false);
    });

    expect(queryByTestId('screen-frame-footer')).toBeNull();
    expect(queryByTestId('group-day-loading')).toBeNull();

    fireEvent.press(getByTestId('group-day-carousel-availability'));
    await Promise.resolve();
    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/day/[date]/availability',
      params: { id: 'group-1', date: '2026-10-12' },
    });
  });

  test('orders the events by time and shows the photos each request returns', async () => {
    mockGetGroupMembers.mockResolvedValue([
      { id: 'user-1', name: 'Ana', profilePic: null },
      { id: 'user-2', name: 'Bia', profilePic: 'https://cdn.alibe.com/bia.jpg' },
    ]);
    mockGetEventDetails.mockImplementation((eventId) =>
      Promise.resolve({
        id: eventId,
        name: eventId === 'event-1' ? 'Bloom Café' : 'Cinema',
        date: '2026-10-12',
        time: eventId === 'event-1' ? '20:00' : '15:00',
        image: null,
        budgetStart: null,
        budgetEnd: null,
        status: 'pending',
        groupId: 'group-1',
        location: null,
        proposal: {
          id: eventId === 'event-1' ? 'proposal-1' : 'proposal-2',
          owner: { id: 'user-1', name: 'Ana', image: 'https://cdn.alibe.com/ana.jpg' },
          responses: [],
          createdAt: '2026-10-01T12:00:00.000Z',
        },
        createdAt: '2026-10-01T12:00:00.000Z',
        updatedAt: '2026-10-01T12:00:00.000Z',
      } satisfies EventDetailsResponse)
    );

    const { getAllByTestId, getByTestId } = await Promise.resolve(render(<DayController />));

    await waitFor(() => {
      expect(
        getAllByTestId(/^group-day-carousel-owner-event-\d$/).map(
          (node) => (node.props as { testID: string }).testID
        )
      ).toEqual(['group-day-carousel-owner-event-2', 'group-day-carousel-owner-event-1']);
    });

    // The owner photo comes from the event details; the participant photos from the members list.
    expect(getByTestId('group-day-carousel-owner-event-1-avatar-photo')).toHaveProp('source', [
      { uri: 'https://cdn.alibe.com/ana.jpg' },
    ]);
    expect(getByTestId('group-day-carousel-participants-event-1-user-1-placeholder')).toBeTruthy();
    expect(getByTestId('group-day-carousel-participants-event-1-user-2-photo')).toHaveProp(
      'source',
      [{ uri: 'https://cdn.alibe.com/bia.jpg' }]
    );
  });
});
