import { fireEvent, render } from '@testing-library/react-native';

import { MemoryCreatedScreen } from '.';

const mockDismissTo = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    dismissTo: mockDismissTo,
  }),
  useLocalSearchParams: () => ({ id: 'group-42' }),
}));

describe('<MemoryCreatedScreen />', () => {
  beforeEach(() => {
    mockDismissTo.mockClear();
  });

  test('renders the confirmation headline and hint', async () => {
    const { getByRole, getByText } = await render(<MemoryCreatedScreen />);

    expect(getByRole('header', { name: 'Memória adicionada!' })).toBeTruthy();
    expect(getByText('Volte a galeria de memórias para conferir!')).toBeTruthy();
  });

  test('renders a single back button', async () => {
    const { getAllByRole, getByText } = await render(<MemoryCreatedScreen />);

    expect(getByText('Voltar')).toBeTruthy();
    expect(getAllByRole('button')).toHaveLength(1);
  });

  test('returns to the memories gallery when the back button is pressed', async () => {
    const { getByTestId } = await render(<MemoryCreatedScreen />);

    await fireEvent.press(getByTestId('memory-created-back'));

    expect(mockDismissTo).toHaveBeenCalledWith({
      pathname: '/group/[id]/memories',
      params: { id: 'group-42' },
    });
  });
});
