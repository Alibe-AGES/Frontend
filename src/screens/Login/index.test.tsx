import { fireEvent, render } from '@testing-library/react-native';
import { LoginScreen } from '.';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: jest.fn(), replace: jest.fn() }),
}));

describe('<LoginScreen />', () => {
  const onContinue = jest.fn();
  const onForgotPassword = jest.fn();

  const renderScreen = () =>
    render(
      <LoginScreen
        onContinue={onContinue}
        onForgotPassword={onForgotPassword}
      />
    );

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders the title and fields', async () => {
    const { getByText, getByPlaceholderText, getByLabelText } =
      await Promise.resolve(renderScreen());

    expect(getByText('Login')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Senha')).toBeTruthy();
    expect(getByLabelText('Voltar')).toBeTruthy();
  });

  test('shows a request error and loading state from the controller', async () => {
    const { getByText, getByTestId } = await Promise.resolve(
      render(
        <LoginScreen
          onContinue={onContinue}
          errorMessage="Não foi possível entrar. Confira seu e-mail e senha."
          isLoading
        />
      )
    );

    expect(getByText('Não foi possível entrar. Confira seu e-mail e senha.')).toBeTruthy();
    expect(getByTestId('login-continue').props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
  });

  test('offers Google sign in', async () => {
    const { getByText, getByLabelText } = await Promise.resolve(renderScreen());

    expect(getByText('Ou continue com')).toBeTruthy();
    expect(getByLabelText('Continuar com Google')).toBeTruthy();
  });

  test('toggles the password visibility', async () => {
    const { getByTestId, getByText } = await Promise.resolve(renderScreen());

    expect(getByTestId('login-password').props.secureTextEntry).toBe(true);

    fireEvent.press(getByText('Mostrar'));
    await Promise.resolve();

    expect(getByTestId('login-password').props.secureTextEntry).toBe(false);
    expect(getByText('Ocultar')).toBeTruthy();
  });

  test('calls onForgotPassword', async () => {
    const { getByText } = await Promise.resolve(renderScreen());

    fireEvent.press(getByText('Esqueci minha senha'));
    await Promise.resolve();

    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['', ''],
    ['user@example.com', ''],
    ['', 'secret'],
    ['   ', 'secret'],
  ])('keeps continue disabled for email "%s" and password "%s"', async (email, password) => {
    const { getByPlaceholderText, getByTestId } = await Promise.resolve(renderScreen());

    fireEvent.changeText(getByPlaceholderText('Email'), email);
    await Promise.resolve();
    fireEvent.changeText(getByPlaceholderText('Senha'), password);
    await Promise.resolve();
    fireEvent.press(getByTestId('login-continue'));
    await Promise.resolve();

    expect(getByTestId('login-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(onContinue).not.toHaveBeenCalled();
  });

  test('continues with the trimmed email and the password', async () => {
    const { getByPlaceholderText, getByTestId } = await Promise.resolve(renderScreen());

    fireEvent.changeText(getByPlaceholderText('Email'), '  user@example.com ');
    await Promise.resolve();
    fireEvent.changeText(getByPlaceholderText('Senha'), 'secret');
    await Promise.resolve();
    fireEvent.press(getByTestId('login-continue'));
    await Promise.resolve();

    expect(onContinue).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret' });
  });
});
