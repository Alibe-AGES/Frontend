import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { useSignUpDraft } from '@/hooks/useSignUpDraft';
import { authClient } from '@/server/auth';
import SignUpController from './controller';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/HandsHiFive', () => ({ HandsHiFive: () => null }));

jest.mock('@/hooks/useSignUpDraft', () => ({
  useSignUpDraft: jest.fn(),
}));

jest.mock('@/server/auth', () => ({
  authClient: { signIn: { social: jest.fn() }, getSession: jest.fn() },
}));

jest.mock('@/notifications/synchronize-push-token', () => ({
  synchronizePushToken: jest.fn(),
}));

const mockSignInSocial = authClient.signIn.social as jest.Mock;
const mockGetSession = authClient.getSession as jest.Mock;

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSignUpDraft = useSignUpDraft as jest.MockedFunction<typeof useSignUpDraft>;

describe('SignUpController', () => {
  const push = jest.fn();
  const replace = jest.fn();
  const setDraft = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push,
      back: jest.fn(),
      canGoBack: () => true,
      replace,
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

  test('creates the account with Google and skips the profile step', async () => {
    mockSignInSocial.mockResolvedValueOnce({ data: { redirect: true }, error: null });
    mockGetSession.mockResolvedValueOnce({ data: { session: { id: 'session-id' } }, error: null });
    const { getByTestId } = await Promise.resolve(render(<SignUpController />));

    await act(async () => {
      fireEvent.press(getByTestId('sign-up-google'));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSignInSocial).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google', callbackURL: '/sign-up' })
    );
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/groups');
    });
    expect(setDraft).not.toHaveBeenCalled();
    expect(push).not.toHaveBeenCalled();
  });

  test('shows the Google error on the sign-up screen', async () => {
    mockSignInSocial.mockResolvedValueOnce({ data: { redirect: true }, error: null });
    mockGetSession.mockResolvedValueOnce({ data: null, error: null });
    const { getByTestId, findByRole } = await Promise.resolve(render(<SignUpController />));

    await act(async () => {
      fireEvent.press(getByTestId('sign-up-google'));
      await Promise.resolve();
    });

    expect(await findByRole('alert')).toHaveTextContent(/Não foi possível entrar com o Google/);
    expect(replace).not.toHaveBeenCalled();
  });
});
