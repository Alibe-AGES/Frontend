import { ApiError } from '@/server/api';
import { signUpWithEmail } from '@/server/auth';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import CreateProfileController from './controller';

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
  useRouter: jest.fn(),
}));

jest.mock('@/server/auth', () => ({
  signUpWithEmail: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseLocalSearchParams = useLocalSearchParams as jest.MockedFunction<
  typeof useLocalSearchParams
>;
const mockSignUp = signUpWithEmail as jest.MockedFunction<typeof signUpWithEmail>;
const ACCOUNT = { email: 'rica@alibe.com', password: 'segredo123' };

describe('CreateProfileController', () => {
  const replace = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
    mockUseLocalSearchParams.mockReturnValue(ACCOUNT);
    mockSignUp.mockResolvedValue({ token: null, user: {} as never });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  async function renderAndFill() {
    const screen = await render(<CreateProfileController />);

    await fireEvent.changeText(screen.getByPlaceholderText('Nome de usuário'), '  Rica  ');
    await fireEvent.press(screen.getByTestId('create-profile-continue'));

    return screen;
  }

  test('creates the account with the sign up data and the nickname', async () => {
    await renderAndFill();

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/groups');
    });
    expect(mockSignUp).toHaveBeenCalledWith({ name: 'Rica', ...ACCOUNT });
  });

  test('stays on the screen and warns when the account cannot be created', async () => {
    mockSignUp.mockRejectedValue(new ApiError('Internal error', 500));

    const { getByTestId } = await renderAndFill();

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({ text2: 'Não foi possível criar sua conta. Tente novamente.' })
      );
    });
    expect(replace).not.toHaveBeenCalled();
    expect(getByTestId('create-profile-continue').props.accessibilityState).toMatchObject({
      disabled: false,
    });
  });

  test('returns to sign up when the account data is missing', async () => {
    mockUseLocalSearchParams.mockReturnValue({});

    await renderAndFill();

    expect(mockSignUp).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/sign-up');
  });
});
