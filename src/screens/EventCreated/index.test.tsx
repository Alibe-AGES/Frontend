import { fireEvent, render } from '@testing-library/react-native';

import { EventCreatedScreen } from '.';

const mockDismissTo = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    dismissTo: mockDismissTo,
  }),
  useLocalSearchParams: () => ({ id: 'group-42' }),
}));

describe('<EventCreatedScreen />', () => {
  beforeEach(() => {
    mockDismissTo.mockClear();
  });

  test('renders the screen with the hands illustration and the logo', async () => {
    const { getByTestId, getByLabelText } = await render(<EventCreatedScreen />);

    expect(getByTestId('event-created-screen')).toBeTruthy();
    expect(getByTestId('event-created-illustration')).toBeTruthy();
    expect(getByTestId('event-created-logo')).toBeTruthy();
    expect(getByLabelText('Alibe')).toBeTruthy();
  });

  test('renders the confirmation headline', async () => {
    const { getByRole } = await render(<EventCreatedScreen />);

    expect(getByRole('header', { name: 'Evento confirmado, vocês tem um álibi!' })).toBeTruthy();
  });

  test('renders the star calendar hint', async () => {
    const { getByText, getByLabelText } = await render(<EventCreatedScreen />);

    const hint = 'Esse evento aparecerá no calendário sinalizado por uma estrela!';
    expect(getByText(hint)).toBeTruthy();
    expect(getByLabelText(hint)).toBeTruthy();
  });

  test('renders a single back button', async () => {
    const { getAllByRole, getByText } = await render(<EventCreatedScreen />);

    expect(getByText('Voltar a tela inicial')).toBeTruthy();
    expect(getAllByRole('button')).toHaveLength(1);
  });

  test('returns to the group main page when the back button is pressed', async () => {
    const { getByTestId } = await render(<EventCreatedScreen />);

    await fireEvent.press(getByTestId('event-created-back-home'));

    expect(mockDismissTo).toHaveBeenCalledTimes(1);
    expect(mockDismissTo).toHaveBeenCalledWith({
      pathname: '/group/[id]',
      params: { id: 'group-42' },
    });
  });
});
