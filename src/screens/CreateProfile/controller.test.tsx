import { useSignUpDraft } from '@/hooks/useSignUpDraft';
import { ApiError } from '@/server/api';
import { authClient } from '@/server/auth-client';
import { signUpWithEmail } from '@/server/auth';
import { updateUserProfilePicture } from '@/server/users';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';
import CreateProfileController from './controller';

interface PermissionResult {
  granted: boolean;
}

interface PickerResult {
  canceled: boolean;
  assets?: { uri: string; fileName?: string | null; mimeType?: string | null }[];
}

const mockRequestPermissions = jest.fn();
const mockLaunchImageLibrary = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/hooks/useSignUpDraft', () => ({
  useSignUpDraft: jest.fn(),
}));

jest.mock('@/server/auth-client', () => ({
  authClient: {
    signIn: {
      email: jest.fn(),
    },
  },
}));

jest.mock('@/server/auth', () => ({
  signUpWithEmail: jest.fn(),
}));

jest.mock('@/server/users', () => ({
  updateUserProfilePicture: jest.fn(),
}));

jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: (): Promise<PermissionResult> =>
    mockRequestPermissions() as Promise<PermissionResult>,
  launchImageLibraryAsync: (): Promise<PickerResult> =>
    mockLaunchImageLibrary() as Promise<PickerResult>,
}));

jest.mock('react-native-toast-message', () => ({
  __esModule: true,
  default: { show: jest.fn() },
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSignUpDraft = useSignUpDraft as jest.MockedFunction<typeof useSignUpDraft>;
const mockSignUp = signUpWithEmail as jest.MockedFunction<typeof signUpWithEmail>;
const mockSignIn = authClient.signIn.email as jest.Mock;
const mockUpdateProfilePicture = updateUserProfilePicture as jest.MockedFunction<
  typeof updateUserProfilePicture
>;
const ACCOUNT = { email: 'rica@alibe.com', password: 'segredo123' };
const PHOTO = {
  uri: 'file://profile.png',
  fileName: 'profile.png',
  mimeType: 'image/png',
};

describe('CreateProfileController', () => {
  const replace = jest.fn();
  const setDraft = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ replace } as unknown as ReturnType<typeof useRouter>);
    mockUseSignUpDraft.mockReturnValue({ getDraft: () => ACCOUNT, setDraft });
    mockSignUp.mockResolvedValue({ token: null, user: {} as never });
    mockSignIn.mockResolvedValue({ data: {}, error: null });
    mockUpdateProfilePicture.mockResolvedValue({
      profilePic: '/users/user-1/profile-picture',
    });
    mockRequestPermissions.mockResolvedValue({ granted: true });
    mockLaunchImageLibrary.mockResolvedValue({
      canceled: false,
      assets: [PHOTO],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  async function renderAndFill(selectPhoto = false) {
    const screen = await render(<CreateProfileController />);

    if (selectPhoto) {
      await fireEvent.press(screen.getByTestId('create-profile-photo'));
      await waitFor(() => {
        expect(screen.getByTestId('create-profile-photo-photo')).toBeTruthy();
      });
    }

    await fireEvent.changeText(screen.getByPlaceholderText('Nome de usuário'), '  Rica  ');
    await fireEvent.press(screen.getByTestId('create-profile-continue'));

    return screen;
  }

  test('creates the account, signs in and opens the groups home', async () => {
    await renderAndFill();

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith('/groups');
    });
    expect(mockSignUp).toHaveBeenCalledWith({ name: 'Rica', ...ACCOUNT });
    expect(mockSignIn).toHaveBeenCalledWith({
      ...ACCOUNT,
      rememberMe: true,
    });
    expect(mockUpdateProfilePicture).not.toHaveBeenCalled();
    expect(setDraft).toHaveBeenCalledWith(null);
  });

  test('uploads the selected profile picture after signing in', async () => {
    await renderAndFill(true);

    await waitFor(() => {
      expect(mockUpdateProfilePicture).toHaveBeenCalledWith(PHOTO);
    });
    expect(replace).toHaveBeenCalledWith('/groups');
  });

  test('stays on the screen and warns when the account cannot be created', async () => {
    mockSignUp.mockRejectedValue(new ApiError('Internal error', 500));

    const { getByTestId } = await renderAndFill();

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Não foi possível concluir seu cadastro. Tente novamente.',
        })
      );
    });
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalled();
    expect(getByTestId('create-profile-continue').props.accessibilityState).toMatchObject({
      disabled: false,
    });
  });

  test('does not continue when automatic login fails', async () => {
    mockSignIn.mockResolvedValue({
      data: null,
      error: { message: 'Invalid email or password' },
    });

    await renderAndFill();

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith(
        expect.objectContaining({
          text2: 'Não foi possível concluir seu cadastro. Tente novamente.',
        })
      );
    });
    expect(mockUpdateProfilePicture).not.toHaveBeenCalled();
    expect(replace).not.toHaveBeenCalledWith('/groups');
  });

  test('returns to sign up when the account data is missing', async () => {
    mockUseSignUpDraft.mockReturnValue({ getDraft: () => null, setDraft });

    await renderAndFill();

    expect(mockSignUp).not.toHaveBeenCalled();
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith('/sign-up');
  });
});
