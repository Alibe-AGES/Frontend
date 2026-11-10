import { synchronizePushToken } from '@/notifications/synchronize-push-token';
import { authClient } from '@/server/auth';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import LoginController from './controller';

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/components/HandsHiFive', () => ({ HandsHiFive: () => null }));

jest.mock('@/server/auth', () => ({
  authClient: { signIn: { email: jest.fn(), social: jest.fn() }, getSession: jest.fn() },
}));

jest.mock('@/notifications/synchronize-push-token', () => ({
  synchronizePushToken: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockSignInEmail = authClient.signIn.email as jest.Mock;
const mockSignInSocial = authClient.signIn.social as jest.Mock;
const mockGetSession = authClient.getSession as jest.Mock;
const mockSynchronizePushToken = synchronizePushToken as jest.MockedFunction<
  typeof synchronizePushToken
>;

describe('LoginController', () => {
  const replace = jest.fn();
  const back = jest.fn();
  const canGoBack = jest.fn(() => true);

  beforeEach(() => {
    mockSignInEmail.mockResolvedValue({ error: null });
    mockSynchronizePushToken.mockResolvedValue('registered');
    mockUseRouter.mockReturnValue({ replace, back, canGoBack } as unknown as ReturnType<
      typeof useRouter
    >);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('authenticates with the entered credentials before routing to groups', async () => {
    const { getByPlaceholderText, getByTestId } = await Promise.resolve(
      render(<LoginController />)
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    await Promise.resolve();
    fireEvent.changeText(getByPlaceholderText('Senha'), 'senha-segura');
    await Promise.resolve();
    await act(async () => {
      fireEvent.press(getByTestId('login-continue'));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSignInEmail).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'senha-segura',
      rememberMe: true,
    });
    expect(mockSynchronizePushToken).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/groups');
    });
  });

  test('shows an error and stays on login when authentication is rejected', async () => {
    mockSignInEmail.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } });
    const { getByPlaceholderText, getByTestId, findByRole } = await Promise.resolve(
      render(<LoginController />)
    );

    fireEvent.changeText(getByPlaceholderText('Email'), 'user@example.com');
    await Promise.resolve();
    fireEvent.changeText(getByPlaceholderText('Senha'), 'wrong-password');
    await Promise.resolve();
    await act(async () => {
      fireEvent.press(getByTestId('login-continue'));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(await findByRole('alert')).toHaveTextContent(/Não foi possível entrar/);
    expect(mockSynchronizePushToken).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
  });

  test('signs in with Google and routes to groups', async () => {
    mockSignInSocial.mockResolvedValueOnce({ data: { redirect: true }, error: null });
    mockGetSession.mockResolvedValueOnce({ data: { session: { id: 'session-id' } }, error: null });
    const { getByTestId } = await Promise.resolve(render(<LoginController />));

    await act(async () => {
      fireEvent.press(getByTestId('login-google'));
      await Promise.resolve();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(mockSignInSocial).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'google', callbackURL: '/login' })
    );
    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/groups');
    });
  });

  test('shows the Google error when the sign-in is not completed', async () => {
    mockSignInSocial.mockResolvedValueOnce({ data: { redirect: true }, error: null });
    mockGetSession.mockResolvedValueOnce({ data: null, error: null });
    const { getByTestId, findByRole } = await Promise.resolve(render(<LoginController />));

    await act(async () => {
      fireEvent.press(getByTestId('login-google'));
      await Promise.resolve();
    });

    expect(await findByRole('alert')).toHaveTextContent(/Não foi possível entrar com o Google/);
    expect(replace).not.toHaveBeenCalled();
  });

  test('pops back to the previous screen', async () => {
    const { getByLabelText } = await Promise.resolve(render(<LoginController />));

    fireEvent.press(getByLabelText('Voltar'));
    await Promise.resolve();

    expect(back).toHaveBeenCalledTimes(1);
    expect(replace).not.toHaveBeenCalled();
  });

  test('falls back to the auth screen when there is nothing to pop', async () => {
    canGoBack.mockReturnValueOnce(false);
    const { getByLabelText } = await Promise.resolve(render(<LoginController />));

    fireEvent.press(getByLabelText('Voltar'));
    await Promise.resolve();

    expect(back).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/auth');
  });

  test('does nothing on forgot password while recovery is not implemented', async () => {
    const { getByText } = await Promise.resolve(render(<LoginController />));

    fireEvent.press(getByText('Esqueci minha senha'));
    await Promise.resolve();

    expect(replace).not.toHaveBeenCalled();
    expect(back).not.toHaveBeenCalled();
  });
});
