import { fireEvent, render } from '@testing-library/react-native';

import { EventCreatedScreen } from '.';

const mockDismissTo = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    dismissTo: mockDismissTo,
  }),
  useLocalSearchParams: () => ({ id: 'group-42' }),
}));

jest.mock('@/components/HandsHiFive', () => {
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    HandsHiFive: ({ variant }: { variant: string }) => <View testID={`hands-hi-five-${variant}`} />,
  };
});

describe('<EventCreatedScreen />', () => {
  beforeEach(() => {
    mockDismissTo.mockClear();
  });

  test('renders the screen with the hands illustration and the logo', async () => {
    const { getByTestId, getByLabelText } = await Promise.resolve(render(<EventCreatedScreen />));

    expect(getByTestId('event-created-screen')).toBeTruthy();
    expect(getByTestId('event-created-illustration')).toBeTruthy();
    expect(getByTestId('hands-hi-five-event-created')).toBeTruthy();
    expect(getByTestId('event-created-logo')).toBeTruthy();
    expect(getByLabelText('Alibe')).toBeTruthy();
  });

  test('renders the confirmation headline', async () => {
    const { getByRole } = await Promise.resolve(render(<EventCreatedScreen />));

    expect(getByRole('header', { name: 'Evento confirmado, vocês tem um álibi!' })).toBeTruthy();
  });

  test('renders the star calendar hint', async () => {
    const { getByText, getByLabelText } = await Promise.resolve(render(<EventCreatedScreen />));

    const hint = 'Esse evento aparecerá no calendário sinalizado por uma estrela!';
    expect(getByText(hint)).toBeTruthy();
    expect(getByLabelText(hint)).toBeTruthy();
  });

  test('renders a single back button', async () => {
    const { getAllByRole, getByText } = await Promise.resolve(render(<EventCreatedScreen />));

    expect(getByText('Voltar a tela inicial')).toBeTruthy();
    expect(getAllByRole('button')).toHaveLength(1);
  });

  test('returns to the group main page when the back button is pressed', async () => {
    const { getByTestId } = await Promise.resolve(render(<EventCreatedScreen />));

    await fireEvent.press(getByTestId('event-created-back-home'));
    await Promise.resolve();

    expect(mockDismissTo).toHaveBeenCalledTimes(1);
    expect(mockDismissTo).toHaveBeenCalledWith({
      pathname: '/group/[id]',
      params: { id: 'group-42' },
    });
  });
});
