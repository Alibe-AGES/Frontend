import { fireEvent, render } from '@testing-library/react-native';
import type { ImageSourcePropType, ImageStyle, StyleProp } from 'react-native';
import { MemoriesScreen, type MemoriesScreenProps } from '.';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    back: jest.fn(),
    canGoBack: () => true,
  }),
}));

jest.mock('@/components/NavigationBar', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    NavigationBar: () => <View testID="navigation-bar" />,
  };
});

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

async function renderScreen(overrides: Partial<MemoriesScreenProps> = {}) {
  const props: MemoriesScreenProps = {
    groupId: 'group-1',
    initialDate: '2026-05-01',
    dayMarks: {
      '2026-05-08': {
        status: 'realized',
        eventIds: ['event-1'],
        memoryIds: ['memory-1', 'memory-2'],
        imageUrl: 'https://cdn.alibe.com/memory-1.jpg',
      },
    },
    onDayPress: jest.fn(),
    onMonthChange: jest.fn(),
    onSeeAllPress: jest.fn(),
    onAddMemory: jest.fn(),
    onRetry: jest.fn(),
    ...overrides,
  };

  const screen = await Promise.resolve(render(<MemoriesScreen {...props} />));

  return { props, ...screen };
}

describe('<MemoriesScreen />', () => {
  test('renders title, see all button, subtitle and the base calendar', async () => {
    const { getByLabelText, getByText, getByTestId } = await renderScreen();

    expect(getByTestId('memories-screen')).toBeTruthy();
    expect(getByLabelText('Voltar para o grupo')).toBeTruthy();
    expect(getByText('Suas memórias')).toBeTruthy();
    expect(getByText('Ver todas')).toBeTruthy();
    expect(getByText('Ou procure pela data do evento')).toBeTruthy();
    expect(getByTestId('memories-calendar')).toBeTruthy();
    expect(getByText('maio')).toBeTruthy();
  });

  test('displays the first memory image on the calendar day when a memory exists', async () => {
    const { getByTestId } = await renderScreen();

    const dayImage = getByTestId('calendar-day-image-2026-05-08');
    expect(dayImage.props.source).toEqual({ uri: 'https://cdn.alibe.com/memory-1.jpg' });
  });

  test('calls onDayPress with the selected date when clicking a day with a memory', async () => {
    const { getByLabelText, props } = await renderScreen();

    fireEvent.press(getByLabelText('Dia 2026-05-08, 1 evento'));
    await Promise.resolve();

    expect(props.onDayPress).toHaveBeenCalledWith('2026-05-08');
  });

  test('calls onSeeAllPress when clicking "Ver todas"', async () => {
    const { getByTestId, props } = await renderScreen();

    fireEvent.press(getByTestId('memories-see-all'));
    await Promise.resolve();

    expect(props.onSeeAllPress).toHaveBeenCalledTimes(1);
  });

  test('calls onMonthChange when changing the month in the calendar header', async () => {
    const { getByTestId, props } = await renderScreen();

    fireEvent.press(getByTestId('calendar-next-month'));
    await Promise.resolve();

    expect(props.onMonthChange).toHaveBeenCalledWith('2026-06-01');
  });

  test('calls onAddMemory when pressing the add button in the header', async () => {
    const { getByTestId, props } = await renderScreen();

    fireEvent.press(getByTestId('memories-add'));
    await Promise.resolve();

    expect(props.onAddMemory).toHaveBeenCalledTimes(1);
  });

  test('renders error message and calls onRetry when retry button is pressed', async () => {
    const { getByTestId, getByText, props } = await renderScreen({
      errorMessage: 'Não foi possível carregar as memórias do calendário.',
    });

    expect(getByTestId('memories-error')).toBeTruthy();
    expect(getByText('Não foi possível carregar as memórias do calendário.')).toBeTruthy();

    fireEvent.press(getByTestId('memories-retry'));
    await Promise.resolve();

    expect(props.onRetry).toHaveBeenCalledTimes(1);
  });

  test('renders the error message without a retry button when onRetry is missing', async () => {
    const { getByTestId, queryByTestId } = await renderScreen({
      errorMessage: 'Não foi possível carregar as memórias do calendário.',
      onRetry: undefined,
    });

    expect(getByTestId('memories-error')).toBeTruthy();
    expect(queryByTestId('memories-retry')).toBeNull();
  });

  test('shows a loading indicator while memories are loading', async () => {
    const { getByTestId } = await renderScreen({ isLoading: true });

    expect(getByTestId('memories-loading')).toBeTruthy();
  });

  test('shows the navigation bar only when there is a group', async () => {
    const withGroup = await renderScreen();
    expect(withGroup.getByTestId('navigation-bar')).toBeTruthy();
    withGroup.unmount();

    const withoutGroup = await renderScreen({ groupId: '' });
    expect(withoutGroup.queryByTestId('navigation-bar')).toBeNull();
  });
});
