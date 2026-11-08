import { render } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useGroupMemories } from '@/hooks/useGroupMemories';
import type { MemoriesCarouselScreenProps } from '.';
import MemoriesCarouselController from './controller';

let mockScreenProps: MemoriesCarouselScreenProps | null = null;

jest.mock('expo-router', () => ({ useLocalSearchParams: jest.fn(), useRouter: jest.fn() }));
jest.mock('@/hooks/useGroupMemories', () => ({ useGroupMemories: jest.fn() }));
jest.mock('.', () => ({
  MemoriesCarouselScreen: (props: MemoriesCarouselScreenProps) => {
    mockScreenProps = props;
    return null;
  },
}));

const mockParams = useLocalSearchParams as jest.MockedFunction<typeof useLocalSearchParams>;
const mockRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseGroupMemories = useGroupMemories as jest.MockedFunction<typeof useGroupMemories>;

const SECTIONS = [
  {
    eventId: 'event-1',
    date: '2026-05-08',
    eventName: 'Jantar',
    address: 'Rua A',
    photos: [
      { id: 'photo-1', imageUrl: 'https://cdn.alibe.com/1.jpg' },
      { id: 'photo-2', imageUrl: 'https://cdn.alibe.com/2.jpg' },
    ],
  },
  {
    eventId: 'event-2',
    date: '2026-05-01',
    eventName: 'Parque',
    photos: [{ id: 'photo-3', imageUrl: 'https://cdn.alibe.com/3.jpg' }],
  },
];

function screenProps(): MemoriesCarouselScreenProps {
  if (!mockScreenProps) throw new Error('screen not rendered');
  return mockScreenProps;
}

describe('MemoriesCarouselController', () => {
  const push = jest.fn();
  const reload = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockScreenProps = null;
    mockRouter.mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>);
    mockUseGroupMemories.mockReturnValue({
      sections: SECTIONS,
      isLoading: false,
      errorMessage: null,
      reload,
    });
  });

  test('flattens the gallery and starts on the tapped photo', async () => {
    mockParams.mockReturnValue({ id: 'group-1', photoId: 'photo-3' });

    await render(<MemoriesCarouselController />);

    expect(screenProps().memories.map((memory) => memory.id)).toEqual([
      'photo-1',
      'photo-2',
      'photo-3',
    ]);
    expect(screenProps().initialIndex).toBe(2);
  });

  test('starts on the first photo when the photo is unknown or missing', async () => {
    mockParams.mockReturnValue({ id: 'group-1', photoId: 'missing' });

    await render(<MemoriesCarouselController />);

    expect(screenProps().initialIndex).toBe(0);
  });

  test('loads the same period the gallery was showing', async () => {
    mockParams.mockReturnValue({ id: 'group-1', month: '9', year: '2026' });

    await render(<MemoriesCarouselController />);

    expect(mockUseGroupMemories).toHaveBeenCalledWith({
      groupId: 'group-1',
      date: undefined,
      month: '9',
      year: '2026',
    });
  });

  test('navigates to the new memory flow and retries loading', async () => {
    mockParams.mockReturnValue({ id: 'group-1' });

    await render(<MemoriesCarouselController />);
    screenProps().onAddMemory();
    screenProps().onRetry();

    expect(push).toHaveBeenCalledWith({
      pathname: '/group/[id]/memories/new',
      params: { id: 'group-1' },
    });
    expect(reload).toHaveBeenCalledTimes(1);
  });

  test('renders nothing without a group id', async () => {
    mockParams.mockReturnValue({});

    await render(<MemoriesCarouselController />);

    expect(mockScreenProps).toBeNull();
  });
});
