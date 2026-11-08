import { fireEvent, render } from '@testing-library/react-native';

import type { CarouselMemory } from '@/utils/memories';
import { MemoriesCarouselScreen, type MemoriesCarouselScreenProps } from '.';

jest.mock('@/components/NavigationBar', () => ({ NavigationBar: () => null }));
jest.mock('@/components/BackButton', () => ({ BackButton: () => null }));
jest.mock('@/hooks/use-authenticated-image-source', () => ({
  useAuthenticatedImageSource: (uri: string | null | undefined) => (uri ? { uri } : null),
}));

const MEMORIES: CarouselMemory[] = [
  {
    id: 'photo-1',
    eventId: 'event-1',
    date: '2026-05-08',
    name: 'Restaurante Giozakaya',
    address: 'Av. Teixeira Mendes 1151',
    imageUrl: 'https://cdn.alibe.com/1.jpg',
  },
  {
    id: 'photo-2',
    eventId: 'event-2',
    date: '2026-05-01',
    name: 'Parque',
    address: 'Rua das Flores 10',
    imageUrl: 'https://cdn.alibe.com/2.jpg',
  },
  {
    id: 'photo-3',
    eventId: 'event-2',
    date: '2026-05-01',
    name: 'Parque',
    address: 'Rua das Flores 10',
    imageUrl: 'https://cdn.alibe.com/3.jpg',
  },
];

async function renderScreen(overrides: Partial<MemoriesCarouselScreenProps> = {}) {
  const props: MemoriesCarouselScreenProps = {
    groupId: 'group-1',
    memories: MEMORIES,
    initialIndex: 0,
    isLoading: false,
    errorMessage: null,
    onAddMemory: jest.fn(),
    onRetry: jest.fn(),
    ...overrides,
  };

  const screen = await render(<MemoriesCarouselScreen {...props} />);

  return { props, ...screen };
}

describe('<MemoriesCarouselScreen />', () => {
  test('renders the title and the memory cards', async () => {
    const { getByText, getByTestId } = await renderScreen();

    expect(getByText('Suas memórias')).toBeTruthy();
    expect(getByTestId('memories-carousel-card-photo-1')).toBeTruthy();
    expect(getByText('Restaurante Giozakaya')).toBeTruthy();
  });

  test('hides the previous arrow on the first memory', async () => {
    const { queryByTestId } = await renderScreen({ initialIndex: 0 });

    expect(queryByTestId('memories-carousel-previous')).toBeNull();
    expect(queryByTestId('memories-carousel-next')).toBeTruthy();
  });

  test('hides the next arrow on the last memory, where the gallery ends', async () => {
    const { queryByTestId } = await renderScreen({ initialIndex: 2 });

    expect(queryByTestId('memories-carousel-next')).toBeNull();
    expect(queryByTestId('memories-carousel-previous')).toBeTruthy();
  });

  test('moves between memories with the arrows', async () => {
    const { getByTestId, queryByTestId } = await renderScreen({ initialIndex: 1 });

    await fireEvent.press(getByTestId('memories-carousel-next'));

    expect(queryByTestId('memories-carousel-next')).toBeNull();
  });

  test('opens the new memory flow from the add button', async () => {
    const { getByTestId, props } = await renderScreen();

    await fireEvent.press(getByTestId('memories-carousel-add'));

    expect(props.onAddMemory).toHaveBeenCalledTimes(1);
  });

  test('shows the loading state', async () => {
    const { getByTestId, queryByTestId } = await renderScreen({ isLoading: true, memories: [] });

    expect(getByTestId('memories-carousel-loading')).toBeTruthy();
    expect(queryByTestId('memories-carousel-list')).toBeNull();
  });

  test('shows the empty state', async () => {
    const { getByTestId } = await renderScreen({ memories: [] });

    expect(getByTestId('memories-carousel-empty')).toBeTruthy();
  });

  test('shows the error state and retries', async () => {
    const { getByTestId, props } = await renderScreen({
      errorMessage: 'Não foi possível carregar as memórias do grupo.',
      memories: [],
    });

    await fireEvent.press(getByTestId('memories-carousel-retry'));

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });
});
