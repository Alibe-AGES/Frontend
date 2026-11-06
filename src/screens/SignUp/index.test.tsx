import { fireEvent, render, within } from '@testing-library/react-native';
import { ScrollView } from 'react-native';
import { SignUpScreen } from '.';

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => true, replace: jest.fn() }),
}));

type GetByPlaceholderText = Awaited<ReturnType<typeof render>>['getByPlaceholderText'];

async function fillForm(
  getByPlaceholderText: GetByPlaceholderText,
  { email = 'rica@alibe.com', password = 'segredo123', confirmation = 'segredo123' } = {}
) {
  fireEvent.changeText(getByPlaceholderText('Email'), email);
  await Promise.resolve();
  fireEvent.changeText(getByPlaceholderText('Senha'), password);
  await Promise.resolve();
  fireEvent.changeText(getByPlaceholderText('Confirmar senha'), confirmation);
  await Promise.resolve();
}

describe('<SignUpScreen />', () => {
  const onContinue = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test.each(['Criar conta', 'Mostrar senhas'])('renders the text %s', async (text) => {
    const { getByText } = await Promise.resolve(render(<SignUpScreen onContinue={onContinue} />));

    expect(getByText(text)).toBeTruthy();
  });

  test('keeps the title on a single line, shrinking it when it does not fit', async () => {
    const { getByText } = await Promise.resolve(render(<SignUpScreen onContinue={onContinue} />));
    const title = getByText('Criar conta');

    expect(title.props.numberOfLines).toBe(1);
    expect(title.props.adjustsFontSizeToFit).toBe(true);
  });

  test('keeps the back button fixed outside the scrollable content', async () => {
    const { UNSAFE_getByType, getByLabelText } = await Promise.resolve(
      render(<SignUpScreen onContinue={onContinue} />)
    );
    const scrollView = within(UNSAFE_getByType(ScrollView));

    expect(getByLabelText('Voltar')).toBeTruthy();
    expect(scrollView.queryByText('Criar conta')).toBeTruthy();
    expect(scrollView.queryByLabelText('Voltar')).toBeNull();
  });

  test('keeps the top fade hidden until the content scrolls', async () => {
    const { getByTestId } = await Promise.resolve(render(<SignUpScreen onContinue={onContinue} />));

    expect(getByTestId('screen-frame-top-fade')).toHaveStyle({ opacity: 0 });
  });

  test('renders the Google sign up option', async () => {
    const { getByText, getByLabelText } = await Promise.resolve(
      render(<SignUpScreen onContinue={onContinue} />)
    );

    expect(getByText('Ou continue com')).toBeTruthy();
    expect(getByLabelText('Continuar com Google')).toBeTruthy();
  });

  test.each(['Email', 'Senha', 'Confirmar senha'])('renders the %s input', async (placeholder) => {
    const { getByPlaceholderText } = await Promise.resolve(
      render(<SignUpScreen onContinue={onContinue} />)
    );

    expect(getByPlaceholderText(placeholder)).toBeTruthy();
  });

  test('keeps the continue button disabled while the form is empty', async () => {
    const { getByTestId } = await Promise.resolve(render(<SignUpScreen onContinue={onContinue} />));

    expect(getByTestId('sign-up-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });

    fireEvent.press(getByTestId('sign-up-continue'));
    await Promise.resolve();

    expect(onContinue).not.toHaveBeenCalled();
  });

  test('keeps the continue button disabled when the email is invalid', async () => {
    const { getByPlaceholderText, getByTestId } = await Promise.resolve(
      render(<SignUpScreen onContinue={onContinue} />)
    );

    await fillForm(getByPlaceholderText, { email: 'rica@alibe' });

    expect(getByTestId('sign-up-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('warns and keeps the button disabled when the passwords do not match', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = await Promise.resolve(
      render(<SignUpScreen onContinue={onContinue} />)
    );

    await fillForm(getByPlaceholderText, { confirmation: 'outra-senha' });

    expect(getByText('As senhas não coincidem.')).toBeTruthy();
    expect(getByTestId('sign-up-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('warns and keeps the button disabled when the password is too short', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = await Promise.resolve(
      render(<SignUpScreen onContinue={onContinue} />)
    );

    await fillForm(getByPlaceholderText, { password: 'curta', confirmation: 'curta' });

    expect(getByText('A senha deve ter pelo menos 8 caracteres.')).toBeTruthy();
    expect(getByTestId('sign-up-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });
  });

  test('does not warn about the passwords before the confirmation is typed', async () => {
    const { getByPlaceholderText, queryByText } = await Promise.resolve(
      render(<SignUpScreen onContinue={onContinue} />)
    );

    fireEvent.changeText(getByPlaceholderText('Senha'), 'segredo123');
    await Promise.resolve();

    expect(queryByText('As senhas não coincidem.')).toBeNull();
  });

  test('sends the trimmed email and the password when the form is valid', async () => {
    const { getByPlaceholderText, getByTestId } = await Promise.resolve(
      render(<SignUpScreen onContinue={onContinue} />)
    );

    await fillForm(getByPlaceholderText, { email: '  rica@alibe.com  ' });
    fireEvent.press(getByTestId('sign-up-continue'));
    await Promise.resolve();

    expect(onContinue).toHaveBeenCalledWith({ email: 'rica@alibe.com', password: 'segredo123' });
  });

  test('hides the passwords by default and shows them when toggled', async () => {
    const { getByPlaceholderText, getByTestId, getByText } = await Promise.resolve(
      render(<SignUpScreen onContinue={onContinue} />)
    );

    expect(getByPlaceholderText('Senha').props.secureTextEntry).toBe(true);
    expect(getByPlaceholderText('Confirmar senha').props.secureTextEntry).toBe(true);

    fireEvent.press(getByTestId('sign-up-show-passwords'));
    await Promise.resolve();

    expect(getByPlaceholderText('Senha').props.secureTextEntry).toBe(false);
    expect(getByPlaceholderText('Confirmar senha').props.secureTextEntry).toBe(false);
    expect(getByText('Ocultar senhas')).toBeTruthy();
  });

  test('shows the email error received from the caller', async () => {
    const { getByText } = await Promise.resolve(
      render(
        <SignUpScreen
          onContinue={onContinue}
          emailError="Este e-mail já está cadastrado."
        />
      )
    );

    expect(getByText('Este e-mail já está cadastrado.')).toBeTruthy();
  });
});
