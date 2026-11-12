import { fireEvent, render } from '@testing-library/react-native';
import type { ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import {
  formatMemoryDate,
  MemoriesGalleryScreen,
  type MemoriesGalleryScreenProps,
  type MemoryEventSection,
} from '.';

jest.mock('@/components/NavigationBar', () => ({
  NavigationBar: () => null,
}));

jest.mock('@/components/BackButton', () => ({
  BackButton: () => null,
}));

jest.mock('@/hooks/use-authenticated-image-source', () => ({
  useAuthenticatedImageSource: (uri: string | null | undefined) => (uri ? { uri } : null),
}));

interface MockExpoImageProps {
  source: unknown;
  testID?: string;
  style?: StyleProp<ImageStyle>;
  accessibilityLabel?: string;
}

jest.mock('expo-image', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Image: ({ source, testID, style, accessibilityLabel }: MockExpoImageProps) => (
      <RN.Image
        source={source as ImageSourcePropType}
        testID={testID}
        style={style}
        accessibilityLabel={accessibilityLabel}
      />
    ),
  };
});

const MOCK_SECTIONS: MemoryEventSection[] = [
  {
    eventId: 'event-1',
    date: '2026-05-08',
    time: '20:00',
    eventName: 'Restaurante Giozakaya',
    photos: [
      { id: 'photo-1', imageUrl: 'https://cdn.alibe.com/photo-1.jpg' },
      { id: 'photo-2', imageUrl: 'https://cdn.alibe.com/photo-2.jpg' },
      { id: 'photo-3', imageUrl: 'https://cdn.alibe.com/photo-3.jpg' },
      { id: 'photo-4', imageUrl: 'https://cdn.alibe.com/photo-4.jpg' },
    ],
  },
  {
    eventId: 'event-2',
    date: '2026-05-08',
    time: '12:30',
    eventName: 'Almoço no Parque',
    photos: [{ id: 'photo-5', imageUrl: 'https://cdn.alibe.com/photo-5.jpg' }],
  },
  {
    eventId: 'event-3',
    date: '2026-05-11',
    time: '09:00',
    eventName: 'Mercado Brasco',
    photos: [
      { id: 'photo-6', imageUrl: 'https://cdn.alibe.com/photo-6.jpg' },
      { id: 'photo-7', imageUrl: 'https://cdn.alibe.com/photo-7.jpg' },
    ],
  },
];

async function renderScreen(overrides: Partial<MemoriesGalleryScreenProps> = {}) {
  const props: MemoriesGalleryScreenProps = {
    groupId: 'group-hermanas',
    sections: MOCK_SECTIONS,
    isLoading: false,
    errorMessage: null,
    onAddMemory: jest.fn(),
    onRetry: jest.fn(),
    ...overrides,
  };

  const screen = await Promise.resolve(render(<MemoriesGalleryScreen {...props} />));

  return { props, ...screen };
}

describe('formatMemoryDate', () => {
  test('formats YYYY-MM-DD as weekday, day and month in Portuguese', () => {
    expect(formatMemoryDate('2026-05-08')).toBe('Sexta, 8 de maio');
    expect(formatMemoryDate('2026-05-11')).toBe('Segunda, 11 de maio');
    expect(formatMemoryDate('2026-03-17')).toBe('Terça, 17 de março');
  });

  test('returns the raw string when date is invalid', () => {
    expect(formatMemoryDate('invalid-date')).toBe('invalid-date');
    expect(formatMemoryDate('2026-02-31')).toBe('2026-02-31');
  });
});

describe('<MemoriesGalleryScreen />', () => {
  test('renders the screen title without favorites controls', async () => {
    const { getByText, queryByText } = await renderScreen();

    expect(getByText('Todas memórias')).toBeTruthy();
    expect(queryByText('Favoritas')).toBeNull();
    expect(queryByText('Todas')).toBeNull();
  });

  test('renders a scrollable list separating different events even on the same day', async () => {
    const { getByTestId, getAllByText, getByText } = await renderScreen();

    expect(getByTestId('memories-gallery-screen')).toBeTruthy();
    expect(getByTestId('memories-gallery-event-event-1')).toBeTruthy();
    expect(getByTestId('memories-gallery-event-event-2')).toBeTruthy();
    expect(getByTestId('memories-gallery-event-event-3')).toBeTruthy();

    expect(getAllByText('Sexta, 8 de maio')).toHaveLength(2);
    expect(getByText('Segunda, 11 de maio')).toBeTruthy();
    expect(getByText('Restaurante Giozakaya')).toBeTruthy();
    expect(getByText('Almoço no Parque')).toBeTruthy();
    expect(getByText('Mercado Brasco')).toBeTruthy();
  });

  test('displays all photos linked to each event in photo-only cards', async () => {
    const { getByTestId } = await renderScreen();

    for (const section of MOCK_SECTIONS) {
      for (const photo of section.photos) {
        expect(getByTestId(`memories-gallery-photo-${photo.id}`)).toBeTruthy();
        const image = getByTestId(`memories-gallery-photo-image-${photo.id}`);
        expect(image.props.source).toEqual({ uri: photo.imageUrl });
      }
    }
  });

  test('triggers onAddMemory when pressing the add button in the header', async () => {
    const { getByTestId, props } = await renderScreen();

    fireEvent.press(getByTestId('memories-gallery-add'));
    await Promise.resolve();

    expect(props.onAddMemory).toHaveBeenCalledTimes(1);
  });

  test('shows the loading state while fetching memories', async () => {
    const { getByTestId, queryByTestId } = await renderScreen({
      isLoading: true,
      sections: [],
    });

    expect(getByTestId('memories-gallery-loading')).toBeTruthy();
    expect(queryByTestId('memories-gallery-empty')).toBeNull();
    expect(queryByTestId('memories-gallery-list')).toBeNull();
  });

  test('shows the empty state when there are no events with memories', async () => {
    const { getByTestId, getByText } = await renderScreen({
      sections: [],
    });

    expect(getByTestId('memories-gallery-empty')).toBeTruthy();
    expect(getByText('Nenhuma memória encontrada para este período.')).toBeTruthy();
  });

  test('shows the error state and calls onRetry when retry button is pressed', async () => {
    const { getByTestId, getByText, queryByTestId, props } = await renderScreen({
      sections: [],
      errorMessage: 'Não foi possível carregar as memórias do grupo.',
    });

    expect(getByTestId('memories-gallery-error')).toBeTruthy();
    expect(getByText('Não foi possível carregar as memórias do grupo.')).toBeTruthy();
    expect(queryByTestId('memories-gallery-empty')).toBeNull();

    fireEvent.press(getByTestId('memories-gallery-retry'));
    await Promise.resolve();

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });
});
