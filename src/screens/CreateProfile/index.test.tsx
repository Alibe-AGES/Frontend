import { fireEvent, render, within } from '@testing-library/react-native';
import { CreateProfileScreen } from '.';

jest.mock('@/assets/images/create-group-decoration.svg', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return () => <RN.View testID="mock-decoration-svg" />;
});

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), canGoBack: () => false, replace: mockReplace }),
}));

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
    const { getByText } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );

    expect(getByText(text)).toBeTruthy();
  });

  test('keeps the title on its two lines, shrinking it when it does not fit', async () => {
    const { getByText } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );
    const title = getByText(/Vamos criar\s+seu perfil\?/);

    expect(title.props.numberOfLines).toBe(2);
    expect(title.props.adjustsFontSizeToFit).toBe(true);
  });

  test('keeps the back button fixed outside the scrollable content', async () => {
    const { getByTestId, getByLabelText } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );
    const scrollView = within(getByTestId('create-profile-screen'));

    expect(getByLabelText('Voltar')).toBeTruthy();
    expect(scrollView.queryByText('Como seus amigos te chamam?')).toBeTruthy();
    expect(scrollView.queryByLabelText('Voltar')).toBeNull();
  });

  test('returns to sign up from the back button when there is no history', async () => {
    const { getByLabelText } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );

    await fireEvent.press(getByLabelText('Voltar'));
    await Promise.resolve();

    expect(mockReplace).toHaveBeenCalledWith('/sign-up');
  });

  test('shows the top fade at rest because the content fits without scrolling', async () => {
    const { getByTestId } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );

    expect(getByTestId('screen-frame-top-fade')).toHaveStyle({ opacity: 1 });
  });

  test('shows the camera placeholder while no photo is selected', async () => {
    const { getByTestId } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );

    expect(getByTestId('create-profile-photo-placeholder')).toBeTruthy();
  });

  test('renders the nickname input', async () => {
    const { getByPlaceholderText } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );

    expect(getByPlaceholderText('Nome de usuário')).toBeTruthy();
  });

  test('keeps the continue button disabled while the nickname is empty', async () => {
    const { getByTestId } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );

    expect(getByTestId('create-profile-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });

    await fireEvent.press(getByTestId('create-profile-continue'));
    await Promise.resolve();

    expect(onContinue).not.toHaveBeenCalled();
  });

  test('keeps the continue button disabled when the nickname only has spaces', async () => {
    const { getByPlaceholderText, getByTestId } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );

    await fireEvent.changeText(getByPlaceholderText('Nome de usuário'), '   ');
    await Promise.resolve();
    await fireEvent.press(getByTestId('create-profile-continue'));
    await Promise.resolve();

    expect(getByTestId('create-profile-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(onContinue).not.toHaveBeenCalled();
  });

  test('enables the continue button once the nickname is filled', async () => {
    const { getByPlaceholderText, getByTestId } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );

    await fireEvent.changeText(getByPlaceholderText('Nome de usuário'), 'Rica');
    await Promise.resolve();

    expect(getByTestId('create-profile-continue').props.accessibilityState).toMatchObject({
      disabled: false,
    });
  });

  test('disables the form while the profile is being submitted', async () => {
    const { getByPlaceholderText, getByTestId } = await Promise.resolve(
      render(
        <CreateProfileScreen
          onContinue={onContinue}
          isSubmitting
        />
      )
    );

    await fireEvent.changeText(getByPlaceholderText('Nome de usuário'), 'Rica');
    await Promise.resolve();
    await fireEvent.press(getByTestId('create-profile-continue'));
    await Promise.resolve();

    expect(getByTestId('create-profile-continue').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(getByTestId('create-profile-photo').props.accessibilityState).toMatchObject({
      disabled: true,
    });
    expect(onContinue).not.toHaveBeenCalled();
  });

  test('continues with the trimmed nickname and no photo', async () => {
    const { getByPlaceholderText, getByTestId } = await Promise.resolve(
      render(<CreateProfileScreen onContinue={onContinue} />)
    );

    await fireEvent.changeText(getByPlaceholderText('Nome de usuário'), '  Rica  ');
    await Promise.resolve();
    await fireEvent.press(getByTestId('create-profile-continue'));
    await Promise.resolve();

    expect(onContinue).toHaveBeenCalledWith({ nickname: 'Rica', photo: null });
  });
});
