import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { CreateGroupScreen } from '.';

const mockPush = jest.fn();
const mockCreateGroup = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/server/groups', () => ({
  createGroup: (input: unknown): Promise<{ id: string }> =>
    mockCreateGroup(input) as Promise<{ id: string }>,
}));

describe('<CreateGroupScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateGroup.mockResolvedValue({ id: 'group-id' });
  });
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

  test('creates the group and navigates to the invite step when continuing', async () => {
    const { getByPlaceholderText, getByText } = await render(<CreateGroupScreen />);

    await fireEvent.changeText(getByPlaceholderText('Nome do grupo'), 'Amigos da faculdade');
    await fireEvent.press(getByText('Continuar'));

    await waitFor(() => {
      expect(mockCreateGroup).toHaveBeenCalledWith({
        name: 'Amigos da faculdade',
        image: null,
      });
      expect(mockPush).toHaveBeenCalledWith({
        pathname: '/create-group/invite',
        params: { groupId: 'group-id' },
      });
    });
  });

  test('does not call the backend when the group name is invalid', async () => {
    const { getByText } = await render(<CreateGroupScreen />);

    await fireEvent.press(getByText('Continuar'));

    expect(getByText('O nome deve conter entre 2 e 100 caracteres.')).toBeTruthy();
    expect(mockCreateGroup).not.toHaveBeenCalled();
  });
});
