import { getActiveProposals, respondToSuggestion } from '@/server/events';
import { act, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import NewExperienceController from './controller';

interface MockScreenProps {
  groupId: string;
  proposal: Awaited<ReturnType<typeof getActiveProposals>>[number] | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  onRetry: () => void;
  onAnswer: (answer: 'yes' | 'no') => void;
}

let mockScreenProps: MockScreenProps;

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({ show: jest.fn() }));
jest.mock('@/server/events', () => ({
  getActiveProposals: jest.fn(),
  respondToSuggestion: jest.fn(),
}));
jest.mock('.', () => ({
  NewExperienceScreen: (props: MockScreenProps) => {
    mockScreenProps = props;
    return null;
  },
}));

const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockUseRouter = jest.mocked(useRouter);
const mockGetActiveProposals = jest.mocked(getActiveProposals);
const mockRespondToSuggestion = jest.mocked(respondToSuggestion);

const proposal = {
  id: 'proposal-1',
  type: 'suggestion' as const,
  groupId: 'group-1',
  name: 'Bloom Café',
  createdAt: '2026-10-22T12:00:00.000Z',
  myAnswer: null,
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
    imageUrl: '/api/locations/location-1/image',
    manuallyCreated: false,
  },
  responses: { yes: 1, no: 0, pending: 2 },
};

async function renderController() {
  render(<NewExperienceController />);
  await act(async () => {
    await Promise.resolve();
  });
  await waitFor(() => {
    expect(mockScreenProps.isLoading).toBe(false);
  });
}

describe('NewExperienceController', () => {
  const replace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1' });
    mockUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
    mockGetActiveProposals.mockResolvedValue([proposal]);
    mockRespondToSuggestion.mockResolvedValue({
      id: 'response-1',
      proposalId: 'proposal-1',
      userId: 'user-2',
      answer: 'yes',
      createdAt: '2026-10-23T12:00:00.000Z',
      matched: false,
    });
  });

  test('loads active proposals for the current group', async () => {
    await renderController();
    await waitFor(() => {
      expect(mockScreenProps.proposal?.id).toBe('proposal-1');
      expect(mockScreenProps.isLoading).toBe(false);
    });
    expect(mockGetActiveProposals).toHaveBeenCalledWith('group-1');
  });

  test('shows the creator proposal but does not record a duplicate answer', async () => {
    mockGetActiveProposals.mockResolvedValue([{ ...proposal, myAnswer: 'yes' }]);
    await renderController();
    await waitFor(() => {
      expect(mockScreenProps.proposal?.myAnswer).toBe('yes');
    });

    act(() => {
      mockScreenProps.onAnswer('yes');
    });
    await Promise.resolve();

    expect(mockRespondToSuggestion).not.toHaveBeenCalled();
    expect(mockScreenProps.proposal?.id).toBe('proposal-1');
  });

  test('allows voting when the API marks an unanswered proposal as pending', async () => {
    mockGetActiveProposals.mockResolvedValue([{ ...proposal, myAnswer: 'pending' }]);
    await renderController();
    await waitFor(() => {
      expect(mockScreenProps.proposal?.myAnswer).toBe('pending');
    });

    await act(async () => {
      mockScreenProps.onAnswer('yes');
      await Promise.resolve();
    });

    expect(mockRespondToSuggestion).toHaveBeenCalledWith('proposal-1', 'yes', false);
  });

  test('records a no response and advances to the next proposal', async () => {
    mockGetActiveProposals.mockResolvedValue([proposal, { ...proposal, id: 'proposal-2' }]);
    await renderController();
    await waitFor(() => {
      expect(mockScreenProps.proposal?.id).toBe('proposal-1');
    });

    await act(async () => {
      mockScreenProps.onAnswer('no');
      await Promise.resolve();
    });

    expect(mockRespondToSuggestion).toHaveBeenCalledWith('proposal-1', 'no', false);
    expect(mockScreenProps.proposal?.id).toBe('proposal-2');
    expect(replace).not.toHaveBeenCalled();
  });

  test('routes the final yes to match confirmation with proposal location details', async () => {
    mockRespondToSuggestion.mockResolvedValueOnce({
      id: 'response-1',
      proposalId: 'proposal-1',
      userId: 'user-2',
      answer: 'yes',
      createdAt: '2026-10-23T12:00:00.000Z',
      matched: true,
    });
    await renderController();
    await waitFor(() => {
      expect(mockScreenProps.proposal?.id).toBe('proposal-1');
    });

    await act(async () => {
      mockScreenProps.onAnswer('yes');
      await Promise.resolve();
    });

    expect(replace).toHaveBeenCalledWith({
      pathname: '/group/[id]/match',
      params: {
        id: 'group-1',
        matchedSuggestionId: 'proposal-1',
        locationId: 'location-1',
        name: 'Bloom Café',
        address: 'Rua Padre Chagas, 320',
        imageUrl: '/api/locations/location-1/image',
      },
    });
  });

  test('does not navigate if the matched proposal has no saved location', async () => {
    mockGetActiveProposals.mockResolvedValue([{ ...proposal, location: null }]);
    mockRespondToSuggestion.mockResolvedValueOnce({
      id: 'response-1',
      proposalId: 'proposal-1',
      userId: 'user-2',
      answer: 'yes',
      createdAt: '2026-10-23T12:00:00.000Z',
      matched: true,
    });
    await renderController();
    await waitFor(() => {
      expect(mockScreenProps.proposal?.id).toBe('proposal-1');
    });

    await act(async () => {
      mockScreenProps.onAnswer('yes');
      await Promise.resolve();
    });

    expect(replace).not.toHaveBeenCalled();
    expect(mockScreenProps.proposal).toBeNull();
  });

  test('shows a toast when a decision cannot be saved', async () => {
    const show = jest.mocked(Toast.show);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    mockRespondToSuggestion.mockRejectedValueOnce(new Error('offline'));
    await renderController();
    await waitFor(() => {
      expect(mockScreenProps.proposal?.id).toBe('proposal-1');
    });

    await act(async () => {
      mockScreenProps.onAnswer('yes');
      await Promise.resolve();
    });

    expect(show).toHaveBeenCalledWith(
      expect.objectContaining({ text2: 'Não foi possível registrar sua escolha. Tente novamente.' })
    );
    expect(mockScreenProps.proposal?.id).toBe('proposal-1');
  });
});
