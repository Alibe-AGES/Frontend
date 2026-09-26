import { fireEvent, render } from '@testing-library/react-native';
import { CreateProfileScreen } from '.';

describe('<CreateProfileScreen />', () => {
  const onContinue = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test.each([
    /Vamos criar\s+seu perfil\?/,
    /Você poderá adicionar ou trocar sua foto e nome de usuário/,
    'Adicionar foto (opcional)',
    'Como seus amigos te chamam?',
  ])('renders the text %s', async (text) => {
    const { getByText } = await render(<CreateProfileScreen onContinue={onContinue} />);

    expect(getByText(text)).toBeTruthy();
  });

  test('shows the camera placeholder while no photo is selected', async () => {
    const { getByTestId } = await render(<CreateProfileScreen onContinue={onContinue} />);

    expect(getByTestId('create-profile-photo-placeholder')).toBeTruthy();
  });

  test('renders the nickname input', async () => {
    const { getByPlaceholderText } = await render(<CreateProfileScreen onContinue={onContinue} />);

    expect(getByPlaceholderText('Nome de usuário')).toBeTruthy();
  });

  test('keeps the continue button disabled while the nickname is empty', async () => {
    const { getByTestId } = await render(<CreateProfileScreen onContinue={onContinue} />);

    expect(getByTestId('create-profile-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });

    await fireEvent.press(getByTestId('create-profile-continue'));

    expect(onContinue).not.toHaveBeenCalled();
  });

  test('keeps the continue button disabled when the nickname only has spaces', async () => {
    const { getByPlaceholderText, getByTestId } = await render(
      <CreateProfileScreen onContinue={onContinue} />
    );

    await fireEvent.changeText(getByPlaceholderText('Nome de usuário'), '   ');
    await fireEvent.press(getByTestId('create-profile-continue'));

    expect(getByTestId('create-profile-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(onContinue).not.toHaveBeenCalled();
  });

  test('enables the continue button once the nickname is filled', async () => {
    const { getByPlaceholderText, getByTestId } = await render(
      <CreateProfileScreen onContinue={onContinue} />
    );

    await fireEvent.changeText(getByPlaceholderText('Nome de usuário'), 'Rica');

    expect(getByTestId('create-profile-continue').props.accessibilityState).toMatchObject({
      disabled: false,
    });
  });

  test('continues with the trimmed nickname and no photo', async () => {
    const { getByPlaceholderText, getByTestId } = await render(
      <CreateProfileScreen onContinue={onContinue} />
    );

    await fireEvent.changeText(getByPlaceholderText('Nome de usuário'), '  Rica  ');
    await fireEvent.press(getByTestId('create-profile-continue'));

    expect(onContinue).toHaveBeenCalledWith({ nickname: 'Rica', photo: null });
  });
});
