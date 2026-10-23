import { createEvent, getProposalDetails } from '@/server/events';
import { getGroupMembers, getMe } from '@/server/groups';
import { act, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MatchController from './controller';

let capturedProps: {
  onSchedule: (date: string, time: string) => Promise<void>;
  proposal: Awaited<ReturnType<typeof getProposalDetails>>;
} | null = null;

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/server/events', () => ({
  createEvent: jest.fn(),
  getProposalDetails: jest.fn(),
}));

jest.mock('@/server/groups', () => ({
  getGroupMembers: jest.fn(),
  getMe: jest.fn(),
}));

jest.mock('./index', () => ({
  MatchScreen: (props: typeof capturedProps) => {
    capturedProps = props;
    return null;
  },
}));

const mockCreateEvent = jest.mocked(createEvent);
const mockGetProposalDetails = jest.mocked(getProposalDetails);
const mockGetGroupMembers = jest.mocked(getGroupMembers);
const mockGetMe = jest.mocked(getMe);
const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockUseRouter = jest.mocked(useRouter);

describe('MatchController', () => {
  const replace = jest.fn();

  beforeEach(() => {
    capturedProps = null;
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1', proposalId: 'proposal-1' });
    mockUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
    mockGetProposalDetails.mockResolvedValue({
      id: 'proposal-1',
      type: 'suggestion',
      groupId: 'group-1',
      eventId: null,
      name: 'Bloom Café',
      date: '2026-10-23',
      createdAt: '2026-10-22T12:00:00.000Z',
      matchedAt: '2026-10-23T12:00:00.000Z',
      matched: true,
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
        priceRange: { start: '50.00', end: '100.00', currencyCode: 'BRL' },
        imageUrl: null,
        manuallyCreated: false,
      },
      myAnswer: 'yes',
    });
    mockGetGroupMembers.mockResolvedValue([
      { id: 'user-1', name: 'Ana', profilePic: null },
      { id: 'user-2', name: 'Kata', profilePic: null },
    ]);
    mockGetMe.mockResolvedValue({ id: 'user-1', name: 'Ana', profilePic: null });
    mockCreateEvent.mockResolvedValue({ id: 'event-1' } as Awaited<ReturnType<typeof createEvent>>);
  });

  afterEach(() => jest.clearAllMocks());

  test('creates the event through the existing endpoint using the saved location ID', async () => {
    await render(<MatchController />);
    await waitFor(() => {
      expect(capturedProps).not.toBeNull();
    });

    await act(async () => {
      await capturedProps?.onSchedule('2026-10-25', '19:30');
    });

    expect(mockCreateEvent).toHaveBeenCalledWith('group-1', {
      name: 'Bloom Café',
      date: '2026-10-25',
      time: '19:30',
      locationId: 'location-1',
      matchedSuggestionId: 'proposal-1',
    });
    expect(replace).toHaveBeenCalledWith({
      pathname: '/group/[id]/event-created',
      params: { id: 'group-1', eventId: 'event-1' },
    });
  });
});
