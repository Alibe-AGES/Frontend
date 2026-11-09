import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import Toast from 'react-native-toast-message';
import { UserProfileScreen, UserProfileScreenProps } from './index';

jest.mock('../../../src/hooks/useUserAvatarSource', () => ({
  useUserAvatarSource: jest.fn(() => null),
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

jest.mock('@/components/ProfileCard', () => {
  const RN = jest.requireActual<typeof import('react-native')>('react-native');
  return {
    ProfileCard: ({ avatarUrl }: { avatarUrl?: string | null }) => (
      <RN.Text testID="profile-card-avatar-source">{avatarUrl ?? 'no-photo'}</RN.Text>
    ),
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

describe('UserProfileScreen', () => {
  const defaultProps: UserProfileScreenProps = {
    userId: 'user-123',
    groupId: 'group-456',
    isOwnProfile: true,
    profile: null,
    isLoading: false,
    error: null,
    refetch: jest.fn(),
    onLogout: jest.fn(),
    onUpdateProfile: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders error state', async () => {
    const errorProps: UserProfileScreenProps = {
      ...defaultProps,
      error: new Error('Network error'),
    };

    const { getByText } = await Promise.resolve(render(<UserProfileScreen {...errorProps} />));

    expect(getByText('Não foi possível carregar o perfil.')).toBeTruthy();
  });

  test('renders user profile info and buttons for own profile', async () => {
    const successProps: UserProfileScreenProps = {
      ...defaultProps,
      profile: {
        name: 'Ellen Miranda',
        created_at: '21 de Setembro de 2026',
        completedEventsCount: 5,
        pendingEventsCount: 2,
        photoUri: null,
      },
    };

    const { getByText, getByTestId } = await Promise.resolve(
      render(<UserProfileScreen {...successProps} />)
    );

    expect(getByTestId('user-profile-screen-name')).toHaveTextContent('Ellen Miranda');
    expect(getByText('no alibe desde 21 de Setembro de 2026')).toBeTruthy();

    expect(getByText('Editar perfil')).toBeTruthy();
    expect(getByText('Alterar Senha')).toBeTruthy();
    expect(getByText('Sair')).toBeTruthy();
  });

  test('keeps edit-profile modal content visible and scrollable', async () => {
    const { getByText, getByTestId, getByPlaceholderText } = await Promise.resolve(
      render(
        <UserProfileScreen
          {...defaultProps}
          profile={{
            name: 'Ellen Miranda',
            created_at: '21 de Setembro de 2026',
            completedEventsCount: 0,
            pendingEventsCount: 0,
            photoUri: null,
          }}
        />
      )
    );

    fireEvent.press(getByText('Editar perfil'));
    await Promise.resolve();

    const editModalScroll = getByTestId('user-profile-edit-modal-scroll');
    expect(editModalScroll.props.contentContainerStyle).toMatchObject({
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
    });
    expect(getByTestId('user-profile-edit-modal-keyboard-container')).toBeTruthy();
    expect(getByTestId('user-profile-edit-modal-panel')).toBeTruthy();
    expect(getByPlaceholderText('Seu nome')).toBeTruthy();
    expect(getByText('Cancelar')).toBeTruthy();
    expect(getByText('Salvar')).toBeTruthy();
  });

  test('keeps the change-password modal centered in a bounded scroll panel', async () => {
    const { getByText, getByTestId } = await Promise.resolve(
      render(<UserProfileScreen {...defaultProps} />)
    );

    fireEvent.press(getByText('Alterar Senha'));
    await Promise.resolve();

    const passwordModalScroll = getByTestId('user-profile-password-modal-scroll');
    expect(passwordModalScroll.props.contentContainerStyle).toMatchObject({
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
    });
    expect(getByTestId('user-profile-password-modal-keyboard-container')).toBeTruthy();
    expect(getByTestId('user-profile-password-modal-panel')).toBeTruthy();
    expect(getByText('Senha Atual')).toBeTruthy();
    expect(getByText('Confirmar Nova Senha')).toBeTruthy();
  });

  test('shows and hides the three password fields with the "Mostrar" toggle', async () => {
    const { getByText, getByLabelText, getByRole } = await Promise.resolve(
      render(<UserProfileScreen {...defaultProps} />)
    );

    fireEvent.press(getByText('Alterar Senha'));
    await Promise.resolve();

    const passwordLabels = ['Senha Atual', 'Nova Senha', 'Confirmar Nova Senha'];

    passwordLabels.forEach((label) => {
      expect(getByLabelText(label).props.secureTextEntry).toBe(true);
    });

    fireEvent.press(getByRole('button', { name: 'Mostrar senha' }));

    expect(getByRole('button', { name: 'Ocultar senha' })).toBeTruthy();
    passwordLabels.forEach((label) => {
      expect(getByLabelText(label).props.secureTextEntry).toBe(false);
    });
  });

  test('hides the passwords again when the change-password modal is reopened', async () => {
    const { getByText, getByLabelText, getByRole } = await Promise.resolve(
      render(<UserProfileScreen {...defaultProps} />)
    );

    fireEvent.press(getByText('Alterar Senha'));
    await Promise.resolve();
    fireEvent.press(getByRole('button', { name: 'Mostrar senha' }));
    fireEvent.press(getByText('Cancelar'));
    await Promise.resolve();

    fireEvent.press(getByText('Alterar Senha'));
    await Promise.resolve();

    expect(getByRole('button', { name: 'Mostrar senha' })).toBeTruthy();
    expect(getByLabelText('Senha Atual').props.secureTextEntry).toBe(true);
  });

  test('uses the loaded profile photo for the avatar', async () => {
    const profilePhotoUrl = 'https://api.alibe.test/users/user-123/profile-picture';
    const { getByTestId } = await Promise.resolve(
      render(
        <UserProfileScreen
          {...defaultProps}
          profile={{
            name: 'Ellen Miranda',
            photoUri: profilePhotoUrl,
            created_at: '21 de Setembro de 2026',
            completedEventsCount: 5,
            pendingEventsCount: 2,
          }}
        />
      )
    );

    expect(getByTestId('profile-card-avatar-source')).toHaveTextContent(profilePhotoUrl);
  });

  test('does not render edit/password/logout buttons when it is not the user own profile', async () => {
    const thirdPartyProfileProps: UserProfileScreenProps = {
      ...defaultProps,
      isOwnProfile: false,
      profile: {
        name: 'Carlos Silva',
        created_at: '10 de Janeiro de 2026',
        completedEventsCount: 1,
        pendingEventsCount: 0,
        photoUri: null,
      },
    };

    const { queryByText, getByTestId } = await Promise.resolve(
      render(<UserProfileScreen {...thirdPartyProfileProps} />)
    );

    expect(getByTestId('user-profile-screen-name')).toHaveTextContent('Carlos Silva');
    expect(queryByText('Editar perfil')).toBeNull();
    expect(queryByText('Alterar Senha')).toBeNull();
    expect(queryByText('Sair')).toBeNull();
  });

  test('opens logout confirmation modal and cancels logout', async () => {
    const onLogout = jest.fn();
    const { getByTestId, getByText, queryByText } = await Promise.resolve(
      render(
        <UserProfileScreen
          {...defaultProps}
          onLogout={onLogout}
        />
      )
    );

    fireEvent.press(getByTestId('user-profile-logout-button'));
    await Promise.resolve();

    expect(getByText('Sair da conta')).toBeTruthy();
    expect(getByText('Tem certeza de que deseja sair da sua conta?')).toBeTruthy();

    fireEvent.press(getByTestId('user-profile-logout-cancel'));
    await Promise.resolve();

    expect(queryByText('Tem certeza de que deseja sair da sua conta?')).toBeNull();
    expect(onLogout).not.toHaveBeenCalled();
  });

  test('calls onLogout when confirming in the logout modal', async () => {
    const onLogout = jest.fn().mockResolvedValue(undefined);
    const { getByTestId } = await Promise.resolve(
      render(
        <UserProfileScreen
          {...defaultProps}
          onLogout={onLogout}
        />
      )
    );

    fireEvent.press(getByTestId('user-profile-logout-button'));
    await Promise.resolve();
    await act(async () => {
      fireEvent.press(getByTestId('user-profile-logout-confirm'));
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(onLogout).toHaveBeenCalledTimes(1);
    });
  });

  test('shows error toast when onLogout rejects', async () => {
    const toastShowSpy = jest.spyOn(Toast, 'show').mockImplementation(jest.fn());
    const onLogout = jest.fn().mockRejectedValue(new Error('Network error'));

    const { getByTestId } = await Promise.resolve(
      render(
        <UserProfileScreen
          {...defaultProps}
          onLogout={onLogout}
        />
      )
    );

    fireEvent.press(getByTestId('user-profile-logout-button'));
    await Promise.resolve();
    await act(async () => {
      fireEvent.press(getByTestId('user-profile-logout-confirm'));
      await Promise.resolve();
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(toastShowSpy).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Erro!',
        text2: 'Não foi possível sair da conta. Tente novamente.',
      });
    });

    toastShowSpy.mockRestore();
  });

  describe('edit profile', () => {
    const profile = {
      name: 'Ellen Miranda',
      created_at: '21 de Setembro de 2026',
      completedEventsCount: 0,
      pendingEventsCount: 0,
      photoUri: null,
    };

    async function openEditModal(props: Partial<UserProfileScreenProps> = {}) {
      const screen = await Promise.resolve(
        render(
          <UserProfileScreen
            {...defaultProps}
            profile={profile}
            {...props}
          />
        )
      );

      fireEvent.press(screen.getByText('Editar perfil'));
      await Promise.resolve();

      return screen;
    }

    async function pressSave(getByTestId: ReturnType<typeof render>['getByTestId']) {
      await act(async () => {
        fireEvent.press(getByTestId('user-profile-edit-save'));
        await Promise.resolve();
        await Promise.resolve();
      });
    }

    test('saves the new name and photo, refreshes the profile and closes the modal', async () => {
      const onUpdateProfile = jest.fn().mockResolvedValue(undefined);
      const refetch = jest.fn();
      const { getByTestId, queryByPlaceholderText } = await openEditModal({
        onUpdateProfile,
        refetch,
      });

      fireEvent.press(getByTestId('mock-photo-picker'));
      fireEvent.changeText(getByTestId('user-profile-edit-name'), 'Ellen M.');
      await pressSave(getByTestId);

      await waitFor(() => {
        expect(onUpdateProfile).toHaveBeenCalledWith({
          name: 'Ellen M.',
          photo: { uri: 'file://nova-foto.jpg', mimeType: 'image/jpeg' },
        });
      });
      expect(refetch).toHaveBeenCalledTimes(1);
      expect(queryByPlaceholderText('Seu nome')).toBeNull();
      expect(getByTestId('profile-card-avatar-source')).toHaveTextContent('file://nova-foto.jpg');
    });

    test('shows an error toast and keeps the modal open when saving fails', async () => {
      const toastShowSpy = jest.spyOn(Toast, 'show').mockImplementation(jest.fn());
      const onUpdateProfile = jest.fn().mockRejectedValue(new Error('Network error'));
      const refetch = jest.fn();
      const { getByTestId, getByPlaceholderText } = await openEditModal({
        onUpdateProfile,
        refetch,
      });

      fireEvent.changeText(getByTestId('user-profile-edit-name'), 'Ellen M.');
      await pressSave(getByTestId);

      await waitFor(() => {
        expect(toastShowSpy).toHaveBeenCalledWith({
          type: 'error',
          text1: 'Erro!',
          text2: 'Não foi possível salvar o perfil. Tente novamente.',
        });
      });
      expect(refetch).not.toHaveBeenCalled();
      expect(getByPlaceholderText('Seu nome')).toBeTruthy();

      toastShowSpy.mockRestore();
    });
  });
});
