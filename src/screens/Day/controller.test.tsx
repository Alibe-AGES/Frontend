import { getGroupCalendar } from '@/server/calendar';
import {
  EventDetailsResponse,
  getEventDetails,
  getProposalDetails,
  respondToEventProposal,
  respondToSuggestion,
} from '@/server/events';
import { getGroupMembers, getMe } from '@/server/groups';
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
  getProposalDetails: jest.fn(),
  respondToEventProposal: jest.fn(),
  respondToSuggestion: jest.fn(),
}));

jest.mock('@/server/groups', () => ({
  getGroupMembers: jest.fn(),
  getMe: jest.fn(),
}));

jest.mock('@/components/BackButton', () => ({
  BackButton: () => null,
}));

jest.mock('@/components/NavigationBar', () => ({
  NavigationBar: () => null,
}));

const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockGetGroupCalendar = getGroupCalendar as jest.MockedFunction<typeof getGroupCalendar>;
const mockGetEventDetails = getEventDetails as jest.MockedFunction<typeof getEventDetails>;
const mockGetProposalDetails = getProposalDetails as jest.MockedFunction<typeof getProposalDetails>;
const mockRespondToEventProposal = respondToEventProposal as jest.MockedFunction<
  typeof respondToEventProposal
>;
const mockRespondToSuggestion = respondToSuggestion as jest.MockedFunction<
  typeof respondToSuggestion
>;
const mockGetGroupMembers = getGroupMembers as jest.MockedFunction<typeof getGroupMembers>;
const mockGetMe = getMe as jest.MockedFunction<typeof getMe>;

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
        suggestionIds: [],
        proposalEventIds: [{ proposalId: 'proposal-2', eventId: 'event-2' }],
        availableUserIds: [],
        completedEventIds: [],
        allUsersAvailable: false,
      },
    ]);
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

  test('loads event and proposal details in the standalone carousel screen', async () => {
    const { getAllByText, getByText, getByTestId } = await render(<DayController />);

    await waitFor(() => {
      expect(mockGetGroupCalendar).toHaveBeenCalledWith('group-1', 10, 2026);
      expect(mockGetEventDetails).toHaveBeenCalledWith('event-1');
      expect(mockGetEventDetails).toHaveBeenCalledWith('event-2');
      expect(getByText('Bloom Café')).toBeTruthy();
      expect(getByText('Cinema')).toBeTruthy();
      expect(getAllByText('Status dos participantes')).toHaveLength(2);
      expect(getAllByText('Eu')).toHaveLength(2);
      expect(getAllByText('Bia')).toHaveLength(2);
      expect(getAllByText('Ana')).toHaveLength(2);
      expect(getAllByText('Confirmar!')).toHaveLength(2);
      expect(getAllByText('Não estarei disponível neste dia')).toHaveLength(2);
      expect(getByText('1 / 2')).toBeTruthy();
    });

    await fireEvent.press(getByTestId('group-day-carousel-next'));
    expect(getByText('2 / 2')).toBeTruthy();

    await fireEvent.press(getByTestId('group-day-carousel-presence-yes-event-2'));
    await waitFor(() => {
      expect(mockRespondToEventProposal).toHaveBeenCalledWith('event-2', 'yes', false);
    });

    await fireEvent.press(getByTestId('group-day-carousel-availability'));
    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/day/[date]/availability',
      params: { id: 'group-1', date: '2026-10-12' },
    });
  });

  test('shows a dated location suggestion and opens the match screen when the final yes matches', async () => {
    mockGetGroupCalendar.mockResolvedValue([
      {
        date: '2026-10-12',
        scheduledEventIds: [],
        proposalIds: [],
        suggestionIds: ['suggestion-1'],
        proposalEventIds: [],
        availableUserIds: [],
        completedEventIds: [],
        allUsersAvailable: false,
      },
    ]);
    mockGetProposalDetails.mockResolvedValue({
      id: 'suggestion-1',
      type: 'suggestion',
      groupId: 'group-1',
      eventId: null,
      name: 'Bloom Café',
      date: '2026-10-12',
      createdAt: '2026-10-10T12:00:00.000Z',
      matchedAt: null,
      matched: false,
      owner: { id: 'user-1', name: 'Ana', image: null },
      location: {
        id: 'location-1',
        externalId: 'google-place-1',
        name: 'Bloom Café',
        description: null,
        address: 'Rua Padre Chagas, 320',
        openingHours: [],
        rating: null,
        phoneNumber: null,
        website: null,
        priceRange: { start: null, end: null, currencyCode: null },
        imageUrl: null,
        manuallyCreated: false,
      },
      myAnswer: null,
    });
    mockRespondToSuggestion.mockResolvedValue({
      id: 'response-1',
      proposalId: 'suggestion-1',
      userId: 'user-3',
      answer: 'yes',
      createdAt: '2026-10-12T12:00:00.000Z',
      matched: true,
    });

    const { getByText, getByTestId } = await render(<DayController />);
    await waitFor(() => {
      expect(getByText('Bloom Café')).toBeTruthy();
    });
    expect(mockGetProposalDetails).toHaveBeenCalledWith('suggestion-1');

    await fireEvent.press(getByTestId('group-day-carousel-presence-yes-suggestion-suggestion-1'));
    await waitFor(() => {
      expect(mockRespondToSuggestion).toHaveBeenCalledWith('suggestion-1', 'yes', false);
      expect(push).toHaveBeenCalledWith({
        pathname: '/group/[id]/match/[proposalId]',
        params: { id: 'group-1', proposalId: 'suggestion-1' },
      });
    });
  });
});
