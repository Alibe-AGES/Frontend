import { fireEvent, render } from '@testing-library/react-native';
import { SignUpScreen } from '.';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn() }),
}));

type GetByPlaceholderText = Awaited<ReturnType<typeof render>>['getByPlaceholderText'];

async function fillForm(
  getByPlaceholderText: GetByPlaceholderText,
  { email = 'rica@alibe.com', password = 'segredo123', confirmation = 'segredo123' } = {}
) {
  await fireEvent.changeText(getByPlaceholderText('Email'), email);
  await fireEvent.changeText(getByPlaceholderText('Senha'), password);
  await fireEvent.changeText(getByPlaceholderText('Confirmar senha'), confirmation);
}

describe('<SignUpScreen />', () => {
  const onContinue = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test.each(['Criar conta', 'Mostrar senhas'])('renders the text %s', async (text) => {
    const { getByText } = await render(<SignUpScreen onContinue={onContinue} />);

    expect(getByText(text)).toBeTruthy();
  });

  test('does not render the Google sign up option', async () => {
    const { queryByText } = await render(<SignUpScreen onContinue={onContinue} />);

    expect(queryByText('Ou continue com')).toBeNull();
  });

  test.each(['Email', 'Senha', 'Confirmar senha'])('renders the %s input', async (placeholder) => {
    const { getByPlaceholderText } = await render(<SignUpScreen onContinue={onContinue} />);

    expect(getByPlaceholderText(placeholder)).toBeTruthy();
  });

  test('keeps the continue button disabled while the form is empty', async () => {
    const { getByTestId } = await render(<SignUpScreen onContinue={onContinue} />);

    expect(getByTestId('sign-up-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });

    await fireEvent.press(getByTestId('sign-up-continue'));

    expect(onContinue).not.toHaveBeenCalled();
  });

  test('keeps the continue button disabled when the email is invalid', async () => {
    const { getByPlaceholderText, getByTestId } = await render(
      <SignUpScreen onContinue={onContinue} />
    );

    await fillForm(getByPlaceholderText, { email: 'rica@alibe' });

    expect(getByTestId('sign-up-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('warns and keeps the button disabled when the passwords do not match', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = await render(
      <SignUpScreen onContinue={onContinue} />
    );

    await fillForm(getByPlaceholderText, { confirmation: 'outra-senha' });

    expect(getByText('As senhas não coincidem.')).toBeTruthy();
    expect(getByTestId('sign-up-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('does not warn about the passwords before the confirmation is typed', async () => {
    const { getByPlaceholderText, queryByText } = await render(
      <SignUpScreen onContinue={onContinue} />
    );

    await fireEvent.changeText(getByPlaceholderText('Senha'), 'segredo123');

    expect(queryByText('As senhas não coincidem.')).toBeNull();
  });

  test('sends the trimmed email and the password when the form is valid', async () => {
    const { getByPlaceholderText, getByTestId } = await render(
      <SignUpScreen onContinue={onContinue} />
    );

    await fillForm(getByPlaceholderText, { email: '  rica@alibe.com  ' });
    await fireEvent.press(getByTestId('sign-up-continue'));

    expect(onContinue).toHaveBeenCalledWith({ email: 'rica@alibe.com', password: 'segredo123' });
  });

  test('hides the passwords by default and shows them when toggled', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = await render(
      <SignUpScreen onContinue={onContinue} />
    );

    expect(getByPlaceholderText('Senha').props.secureTextEntry).toBe(true);
    expect(getByPlaceholderText('Confirmar senha').props.secureTextEntry).toBe(true);

    await fireEvent.press(getByTestId('sign-up-show-passwords'));

    expect(getByPlaceholderText('Senha').props.secureTextEntry).toBe(false);
    expect(getByPlaceholderText('Confirmar senha').props.secureTextEntry).toBe(false);
    expect(getByText('Ocultar senhas')).toBeTruthy();
  });

  test('shows the email error received from the caller', async () => {
    const { getByText } = await render(
      <SignUpScreen
        onContinue={onContinue}
        emailError="Este e-mail já está cadastrado."
      />
    );

    expect(getByText('Este e-mail já está cadastrado.')).toBeTruthy();
  });
});
