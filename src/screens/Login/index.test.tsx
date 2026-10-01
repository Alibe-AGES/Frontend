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
    const { getByText, getByPlaceholderText, getByLabelText } = await renderScreen();

    expect(getByText('Login')).toBeTruthy();
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Senha')).toBeTruthy();
    expect(getByLabelText('Voltar')).toBeTruthy();
  });

  test('shows a request error and loading state from the controller', async () => {
    const { getByText, getByTestId } = await render(
      <LoginScreen
        onContinue={onContinue}
        error="E-mail ou senha inválidos."
        isSubmitting
      />
    );

    expect(getByText('E-mail ou senha inválidos.')).toBeTruthy();
    expect(getByTestId('login-continue').props.accessibilityState).toMatchObject({
      disabled: true,
      busy: true,
    });
  });

  test('does not offer Google sign in', async () => {
    const { queryByText } = await renderScreen();

    expect(queryByText('Ou continue com')).toBeNull();
  });

  test('toggles the password visibility', async () => {
    const { getByTestId, getByText } = await renderScreen();

    expect(getByTestId('login-password').props.secureTextEntry).toBe(true);

    await fireEvent.press(getByText('Mostrar'));

    expect(getByTestId('login-password').props.secureTextEntry).toBe(false);
    expect(getByText('Ocultar')).toBeTruthy();
  });

  test('calls onForgotPassword', async () => {
    const { getByText } = await renderScreen();

    await fireEvent.press(getByText('Esqueci minha senha'));

    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['', ''],
    ['user@example.com', ''],
    ['', 'secret'],
    ['   ', 'secret'],
  ])('keeps continue disabled for email "%s" and password "%s"', async (email, password) => {
    const { getByPlaceholderText, getByTestId } = await renderScreen();

    await fireEvent.changeText(getByPlaceholderText('Email'), email);
    await fireEvent.changeText(getByPlaceholderText('Senha'), password);
    await fireEvent.press(getByTestId('login-continue'));

    expect(getByTestId('login-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(onContinue).not.toHaveBeenCalled();
  });

  test('continues with the trimmed email and the password', async () => {
    const { getByPlaceholderText, getByTestId } = await renderScreen();

    await fireEvent.changeText(getByPlaceholderText('Email'), '  user@example.com ');
    await fireEvent.changeText(getByPlaceholderText('Senha'), 'secret');
    await fireEvent.press(getByTestId('login-continue'));

    expect(onContinue).toHaveBeenCalledWith({ email: 'user@example.com', password: 'secret' });
  });
});
