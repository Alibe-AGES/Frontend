import { fireEvent, render } from '@testing-library/react-native';
import { CreateGroupScreen } from './CreateGroupScreen';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('<CreateGroupScreen />', () => {
  test('renders the main title', async () => {
    const { getByText } = await render(<CreateGroupScreen />);

    expect(getByText(/Vamos\s+começar\?/)).toBeTruthy();
  });

  test('renders the subtitle', async () => {
    const { getByText } = await render(<CreateGroupScreen />);

    expect(getByText('Seu próximo encontro nasce aqui.')).toBeTruthy();
  });

  test('renders the optional photo section', async () => {
    const { getByText } = await render(<CreateGroupScreen />);

    expect(getByText('Adicionar foto (opcional)')).toBeTruthy();
  });

  test('renders the group name input', async () => {
    const { getByPlaceholderText } = await render(<CreateGroupScreen />);

    expect(getByPlaceholderText('Nome do grupo')).toBeTruthy();
  });

  test('lets the user enter a group name', async () => {
    const { getByDisplayValue, getByPlaceholderText } = await render(<CreateGroupScreen />);

    await fireEvent.changeText(getByPlaceholderText('Nome do grupo'), 'Amigos da faculdade');

    expect(getByDisplayValue('Amigos da faculdade')).toBeTruthy();
  });

  test('renders the continue button', async () => {
    const { getByText } = await render(<CreateGroupScreen />);

    expect(getByText('Continuar')).toBeTruthy();
  });

  test('navigates to the invite step when continuing', async () => {
    const { getByText } = await render(<CreateGroupScreen />);

    await fireEvent.press(getByText('Continuar'));

    expect(mockPush).toHaveBeenCalledWith('/create-group/invite');
  });
});
