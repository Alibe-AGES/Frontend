import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { authClient } from '@/server/auth-client';
import LoginController from './controller';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockSignInEmail = authClient.signIn.email as jest.Mock;

describe('LoginController', () => {
  const replace = jest.fn();
  const back = jest.fn();
  const canGoBack = jest.fn(() => true);

  beforeEach(() => {
    mockSignInEmail.mockResolvedValue({ data: {}, error: null });
    mockUseRouter.mockReturnValue({ replace, back, canGoBack } as unknown as ReturnType<
      typeof useRouter
    >);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('goes to the groups home after filling the credentials', async () => {
    const { getByPlaceholderText, getByTestId } = await render(<LoginController />);

    await fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    await fireEvent.changeText(getByPlaceholderText('Senha'), 'senha-segura');
    await fireEvent.press(getByTestId('login-continue'));

    expect(mockSignInEmail).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'senha-segura',
      rememberMe: true,
    });
    expect(replace).toHaveBeenCalledWith('/groups');
  });

  test('shows the backend error and does not navigate when credentials are invalid', async () => {
    mockSignInEmail.mockResolvedValue({
      data: null,
      error: { message: 'E-mail ou senha inválidos.' },
    });
    const { getByPlaceholderText, getByTestId, getByText } = await render(<LoginController />);

    await fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    await fireEvent.changeText(getByPlaceholderText('Senha'), 'senha-incorreta');
    await fireEvent.press(getByTestId('login-continue'));

    expect(getByText('E-mail ou senha inválidos.')).toBeTruthy();
    expect(replace).not.toHaveBeenCalled();
  });

  test('pops back to the previous screen', async () => {
    const { getByLabelText } = await render(<LoginController />);

    await fireEvent.press(getByLabelText('Voltar'));

    expect(back).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  test('falls back to the auth screen when there is nothing to pop', async () => {
    canGoBack.mockReturnValueOnce(false);
    const { getByLabelText } = await render(<LoginController />);

    await fireEvent.press(getByLabelText('Voltar'));

    expect(back).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/auth');
  });

  test('does nothing on forgot password while recovery is not implemented', async () => {
    const { getByText } = await render(<LoginController />);

    await fireEvent.press(getByText('Esqueci minha senha'));

    expect(replace).not.toHaveBeenCalled();
    expect(back).not.toHaveBeenCalled();
  });
});
