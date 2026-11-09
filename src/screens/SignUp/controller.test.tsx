import { fireEvent, render } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useSignUpDraft } from '@/hooks/useSignUpDraft';
import SignUpController from './controller';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/HandsHiFive', () => ({ HandsHiFive: () => null }));

jest.mock('@/hooks/useSignUpDraft', () => ({
  useSignUpDraft: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSignUpDraft = useSignUpDraft as jest.MockedFunction<typeof useSignUpDraft>;

describe('SignUpController', () => {
  const push = jest.fn();
  const setDraft = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push,
      back: jest.fn(),
      canGoBack: () => true,
      replace: jest.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    mockUseSignUpDraft.mockReturnValue({ getDraft: () => null, setDraft });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('keeps the account data in memory and goes to the profile step', async () => {
    const { getByPlaceholderText, getByTestId } = await Promise.resolve(
      render(<SignUpController />)
    );

    await fireEvent.changeText(getByPlaceholderText('Email'), 'rica@alibe.com');
    await Promise.resolve();
    await fireEvent.changeText(getByPlaceholderText('Senha'), 'segredo123');
    await Promise.resolve();
    await fireEvent.changeText(getByPlaceholderText('Confirmar senha'), 'segredo123');
    await Promise.resolve();
    await fireEvent.press(getByTestId('sign-up-continue'));
    await Promise.resolve();

    expect(setDraft).toHaveBeenCalledWith({ email: 'rica@alibe.com', password: 'segredo123' });
    expect(push).toHaveBeenCalledWith('/profile');
  });
});
