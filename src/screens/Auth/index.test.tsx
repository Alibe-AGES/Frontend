import { fireEvent, render } from '@testing-library/react-native';

import { AuthScreen } from '.';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('<AuthScreen />', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  test('renders the screen with its illustration', async () => {
    const { getByTestId } = await Promise.resolve(render(<AuthScreen />));

    expect(getByTestId('auth-screen')).toBeTruthy();
    expect(getByTestId('auth-illustration')).toBeTruthy();
  });

  test('renders the headline texts', async () => {
    const { getByText, getByLabelText } = await Promise.resolve(render(<AuthScreen />));

    expect(getByText('Encontrar')).toBeTruthy();
    expect(getByText('os')).toBeTruthy();
    expect(getByText('amigos')).toBeTruthy();
    expect(getByText('não precisa ser um')).toBeTruthy();
    expect(getByText('desafio')).toBeTruthy();
    expect(getByLabelText('Encontrar os amigos não precisa ser um desafio')).toBeTruthy();
  });

  test('renders the Login and Criar conta buttons', async () => {
    const { getAllByRole, getByText } = await Promise.resolve(render(<AuthScreen />));

    expect(getByText('Login')).toBeTruthy();
    expect(getByText('Criar conta')).toBeTruthy();
    expect(getAllByRole('button')).toHaveLength(2);
  });

  test('navigates to the login screen when Login is pressed', async () => {
    const { getByText } = await Promise.resolve(render(<AuthScreen />));

    fireEvent.press(getByText('Login'));
    await Promise.resolve();

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  test('navigates to the sign-up screen when Criar conta is pressed', async () => {
    const { getByText } = await Promise.resolve(render(<AuthScreen />));

    fireEvent.press(getByText('Criar conta'));
    await Promise.resolve();

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/sign-up');
  });
});
