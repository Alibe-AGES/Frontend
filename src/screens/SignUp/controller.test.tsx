import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import SignUpController from './controller';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('SignUpController', () => {
  const push = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push,
      back: jest.fn(),
      canGoBack: () => true,
      replace: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('goes to the profile step after the account data is filled', async () => {
    const { getByPlaceholderText, getByTestId } = await render(<SignUpController />);

    await fireEvent.changeText(getByPlaceholderText('Email'), 'rica@alibe.com');
    await fireEvent.changeText(getByPlaceholderText('Senha'), 'segredo123');
    await fireEvent.changeText(getByPlaceholderText('Confirmar senha'), 'segredo123');
    await fireEvent.press(getByTestId('sign-up-continue'));

    expect(push).toHaveBeenCalledWith('/profile');
  });
});
