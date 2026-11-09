import { signOut } from '@/server/auth';
import { getMyProfile, updateMyProfile, updateUserProfilePicture } from '@/server/users';
import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import UserProfileController from './controller';

const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
  useLocalSearchParams: () => ({
    userId: 'user-1',
    groupId: 'group-1',
  }),
}));

jest.mock('@/server/auth', () => ({
  signOut: jest.fn(),
}));

jest.mock('@/server/users', () => ({
  getMyProfile: jest.fn(),
  updateMyProfile: jest.fn(),
  updateUserProfilePicture: jest.fn(),
}));

jest.mock('../../../src/hooks/useUserAvatarSource', () => ({
  useUserAvatarSource: jest.fn(() => null),
}));

jest.mock('@/hooks/use-authenticated-image-source', () => ({
  useAuthenticatedImageSource: (uri?: string) => (uri ? { uri } : null),
}));

jest.mock('@/components/PhotoPicker', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    PhotoPicker: ({ onUploadSuccess }: { onUploadSuccess?: (photo: object) => void }) => (
      <RN.Pressable
        testID="mock-photo-picker"
        onPress={() => onUploadSuccess?.({ uri: 'file://nova-foto.jpg', mimeType: 'image/jpeg' })}
      />
    ),
  };
});

jest.mock('@/components/BackButton', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    BackButton: () => <RN.View testID="mock-back-button" />,
  };
});

jest.mock('@/components/NavigationBar', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    NavigationBar: () => <RN.View testID="mock-navigation-bar" />,
  };
});

jest.mock('@expo/vector-icons', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    Ionicons: () => <RN.View testID="mock-ionicons" />,
  };
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
}));

const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockGetMyProfile = getMyProfile as jest.MockedFunction<typeof getMyProfile>;
const mockUpdateMyProfile = updateMyProfile as jest.MockedFunction<typeof updateMyProfile>;
const mockUpdateUserProfilePicture = updateUserProfilePicture as jest.MockedFunction<
  typeof updateUserProfilePicture
>;

async function renderProfileController() {
  const result = render(<UserProfileController />);
  const request = mockGetMyProfile.mock.results.at(-1)?.value as Promise<unknown> | undefined;
  await act(async () => {
    await request;
    await Promise.resolve();
    await Promise.resolve();
  });
  return result;
}

describe('UserProfileController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMyProfile.mockResolvedValue({
      name: 'Ana Beatriz Silva',
      profilePic: '/users/user-1/profile-picture',
      createdAt: '2026-09-30T01:52:41.223Z',
      completedEvents: 3,
      eventsInDecision: 1,
    });
  });

  test('calls signOut and redirects to /auth when user confirms logout', async () => {
    mockSignOut.mockResolvedValue({ success: true });

    const { getByTestId } = await renderProfileController();

    await waitFor(() => {
      expect(mockGetMyProfile).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(getByTestId('user-profile-logout-button'));
    await Promise.resolve();
    fireEvent.press(getByTestId('user-profile-logout-confirm'));
    await Promise.resolve();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith('/auth');
    });
  });

  test('does not redirect to /auth when signOut fails', async () => {
    mockSignOut.mockRejectedValue(new Error('Logout failed'));

    const { getByTestId } = await renderProfileController();

    await waitFor(() => {
      expect(mockGetMyProfile).toHaveBeenCalledTimes(1);
    });

    fireEvent.press(getByTestId('user-profile-logout-button'));
    await Promise.resolve();
    fireEvent.press(getByTestId('user-profile-logout-confirm'));
    await Promise.resolve();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });

    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('uses an absolute profile photo URL as it is', async () => {
    const photoUrl = 'https://tse1.mm.bing.net/th/id/OIP.eV2p-CGFxIff8EmZxacNxgHaFg';
    mockGetMyProfile.mockResolvedValue({
      name: 'Ana Beatriz Silva',
      profilePic: photoUrl,
      createdAt: '2026-09-30T01:52:41.223Z',
      completedEvents: 3,
      eventsInDecision: 1,
    });

    const { getByLabelText } = await renderProfileController();

    await waitFor(() => {
      expect(getByLabelText('Foto de perfil')).toHaveProp('source', [{ uri: photoUrl }]);
    });
  });

  async function saveProfileEdit(getByTestId: ReturnType<typeof render>['getByTestId']) {
    await act(async () => {
      fireEvent.press(getByTestId('user-profile-edit-save'));
      await Promise.resolve();
      await Promise.resolve();
    });
  }

  test('sends only the new name when no photo was chosen', async () => {
    mockUpdateMyProfile.mockResolvedValue({ name: 'Ana Silva' });

    const { getByTestId, getByText } = await renderProfileController();

    fireEvent.press(getByText('Editar perfil'));
    await Promise.resolve();
    fireEvent.changeText(getByTestId('user-profile-edit-name'), '  Ana Silva  ');
    await saveProfileEdit(getByTestId);

    await waitFor(() => {
      expect(mockUpdateMyProfile).toHaveBeenCalledWith({ name: 'Ana Silva' });
    });
    expect(mockUpdateUserProfilePicture).not.toHaveBeenCalled();
  });

  test('sends only the new photo when the name did not change', async () => {
    mockUpdateUserProfilePicture.mockResolvedValue({ profilePic: '/users/user-1/profile-picture' });

    const { getByTestId, getByText } = await renderProfileController();

    fireEvent.press(getByText('Editar perfil'));
    await Promise.resolve();
    fireEvent.press(getByTestId('mock-photo-picker'));
    await saveProfileEdit(getByTestId);

    await waitFor(() => {
      expect(mockUpdateUserProfilePicture).toHaveBeenCalledWith({
        uri: 'file://nova-foto.jpg',
        mimeType: 'image/jpeg',
      });
    });
    expect(mockUpdateMyProfile).not.toHaveBeenCalled();
  });
});
