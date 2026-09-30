import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import LoginController from './controller';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('LoginController', () => {
  const replace = jest.fn();
  const dismissTo = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ replace, dismissTo } as unknown as ReturnType<
      typeof useRouter
    >);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('goes to the groups home after filling the credentials', async () => {
    const { getByPlaceholderText, getByTestId } = await render(<LoginController />);

    await fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    await fireEvent.changeText(getByPlaceholderText('Senha'), 'secret');
    await fireEvent.press(getByTestId('login-continue'));

    expect(replace).toHaveBeenCalledWith('/groups');
  });

  test('goes back to the auth screen', async () => {
    const { getByLabelText } = await render(<LoginController />);

    await fireEvent.press(getByLabelText('Voltar'));

    expect(dismissTo).toHaveBeenCalledWith('/auth');
  });

  test('does nothing on forgot password while recovery is not implemented', async () => {
    const { getByText } = await render(<LoginController />);

    await fireEvent.press(getByText('Esqueci minha senha'));

    expect(replace).not.toHaveBeenCalled();
    expect(dismissTo).not.toHaveBeenCalled();
  });
});
