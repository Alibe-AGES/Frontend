import type { MatchScreenProps } from '@/screens/Match';
import { getGroup, getMe } from '@/server/groups';
import { act, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MatchController from './controller';

let mockScreenProps: MatchScreenProps;

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/server/groups', () => ({
  getGroup: jest.fn(),
  getMe: jest.fn(),
}));

jest.mock('@/screens/Match', () => ({
  MatchScreen: (props: MatchScreenProps) => {
    mockScreenProps = props;
    return null;
  },
}));

const mockUseLocalSearchParams = jest.mocked(useLocalSearchParams);
const mockUseRouter = jest.mocked(useRouter);
const mockGetGroup = jest.mocked(getGroup);
const mockGetMe = jest.mocked(getMe);

describe('MatchController', () => {
  const replace = jest.fn();

  beforeEach(() => {
    mockUseLocalSearchParams.mockReturnValue({
      id: 'group-1',
      matchedSuggestionId: 'proposal-1',
      locationId: 'location-1',
      name: 'Bloom Café',
      address: 'Rua Padre Chagas, 320',
    });
    mockUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
    mockGetGroup.mockResolvedValue({
      id: 'group-1',
      name: 'Hermanas',
      profilePic: null,
      createdAt: '2026-01-01T00:00:00.000Z',
      participants: [
        { id: 'user-1', name: 'Luiza', profilePic: null },
        { id: 'user-2', name: 'Kata', profilePic: null },
      ],
    });
    mockGetMe.mockResolvedValue({ id: 'user-1', name: 'Luiza', profilePic: null });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('loads group members and continues to event creation with matched details', async () => {
    await render(<MatchController />);

    await waitFor(() => {
      expect(mockScreenProps.participants).toHaveLength(2);
      expect(mockScreenProps.currentUserId).toBe('user-1');
      expect(mockScreenProps.isLoadingParticipants).toBe(false);
    });

    await act(() => {
      mockScreenProps.onConfirm();
    });

    expect(replace).toHaveBeenCalledWith({
      pathname: '/group/[id]/create-event',
      params: {
        id: 'group-1',
        matchedSuggestionId: 'proposal-1',
        locationId: 'location-1',
        name: 'Bloom Café',
        address: 'Rua Padre Chagas, 320',
      },
    });
  });

  test('disables confirmation when matched location details are missing', async () => {
    mockUseLocalSearchParams.mockReturnValue({ id: 'group-1' });
    await render(<MatchController />);

    expect(mockScreenProps.isConfirmDisabled).toBe(true);
    await act(() => {
      mockScreenProps.onConfirm();
    });
    expect(replace).not.toHaveBeenCalled();
  });
});
