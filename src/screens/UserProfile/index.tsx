import { BackButton } from '@/components/BackButton';
import { ModalFrame } from '@/components/ModalFrame';
import { NavigationBar } from '@/components/NavigationBar';
import { PasswordInput } from '@/components/PasswordInput';
import { PhotoPicker } from '@/components/PhotoPicker';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { ProfileCard } from '@/components/ProfileCard';
import { ScreenFrame } from '@/components/ScreenFrame';
import { TextInput } from '@/components/TextInput';
import { ApiError } from '@/server/api';
import type { UpdatePasswordInput } from '@/server/users';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';
import { useUserAvatarSource } from '../../../src/hooks/useUserAvatarSource';

const MIN_PASSWORD_LENGTH = 8;

const ProfileMenuButton = ({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="w-full flex-row items-center rounded-full border bg-surface p-2"
    style={{ borderColor: theme.colors.ink }}
    activeOpacity={0.7}
    testID={testID}
  >
    <View className="mr-4 h-10 w-10 items-center justify-center rounded-full border bg-coral">
      <Ionicons
        name={icon}
        size={20}
        color={theme.colors.surface}
      />
    </View>
    <Text
      className="flex-1 font-poppins text-lg"
      style={{ color: theme.colors.wine }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

function ProfileHeading({
  isLoading,
  error,
  name,
}: {
  isLoading: boolean;
  error: Error | null;
  name?: string;
}) {
  if (isLoading) {
    return (
      <ActivityIndicator
        color={theme.colors.wine}
        testID="user-profile-screen-loading"
      />
    );
  }

  if (error) {
    return (
      <Text
        className="text-center font-poppins text-sm"
        style={{ color: theme.colors.wine }}
      >
        Não foi possível carregar o perfil.
      </Text>
    );
  }

  return (
    <Text
      className="text-center font-poppins-semibold text-2xl"
      style={{ color: theme.colors.wine }}
      testID="user-profile-screen-name"
    >
      {name}
    </Text>
  );
}

export interface ProfileData {
  name: string;
  photoUri: string | null;
  created_at: string;
  completedEventsCount: number;
  pendingEventsCount: number;
}

export interface UserProfileUpdate {
  name: string;
  photo: SelectedPhoto | null;
}

export interface UserProfileScreenProps {
  userId?: string;
  groupId?: string;
  isOwnProfile: boolean;
  profile: ProfileData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  onLogout?: () => Promise<void> | void;
  onUpdateProfile?: (update: UserProfileUpdate) => Promise<void>;
  onChangePassword?: (input: UpdatePasswordInput) => Promise<void>;
}

export const UserProfileScreen = ({
  userId,
  groupId,
  isOwnProfile,
  profile,
  isLoading,
  error,
  refetch,
  onLogout,
  onUpdateProfile,
  onChangePassword,
}: UserProfileScreenProps) => {
  const networkAvatarSource = useUserAvatarSource(userId);

  const [localAvatarOverride, setLocalAvatarOverride] = useState<string | null>(null);
  const avatarSource = localAvatarOverride ?? profile?.photoUri ?? networkAvatarSource;

  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [arePasswordsVisible, setArePasswordsVisible] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const shouldShowPasswordChangedToast = useRef(false);

  const newPasswordTooShort = newPassword.length > 0 && newPassword.length < MIN_PASSWORD_LENGTH;
  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword;
  const canSavePassword =
    currentPassword.length > 0 &&
    newPassword.length >= MIN_PASSWORD_LENGTH &&
    confirmPassword === newPassword &&
    !isSubmittingPassword;

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editModalKey, setEditModalKey] = useState(0);
  const [editName, setEditName] = useState('');
  const [editPhoto, setEditPhoto] = useState<SelectedPhoto | null>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  const shouldShowProfileUpdatedToast = useRef(false);

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (profile) {
      setEditName(profile.name);
    }
  }, [profile]);

  useEffect(() => {
    if (isEditModalVisible || !shouldShowProfileUpdatedToast.current) return;

    shouldShowProfileUpdatedToast.current = false;
    Toast.show({
      type: 'success',
      text1: 'Sucesso!',
      text2: 'Perfil atualizado com sucesso.',
    });
  }, [isEditModalVisible]);

  useEffect(() => {
    if (isPasswordModalVisible || !shouldShowPasswordChangedToast.current) return;

    shouldShowPasswordChangedToast.current = false;
    Toast.show({
      type: 'success',
      text1: 'Sucesso!',
      text2: 'Senha alterada com sucesso.',
    });
  }, [isPasswordModalVisible]);

  const handleOpenEditModal = () => {
    setEditName(profile?.name ?? '');
    setEditPhoto(null);
    setEditModalKey((k) => k + 1);
    setEditModalVisible(true);
  };

  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditName(profile?.name ?? '');
    setEditPhoto(null);
  };

  const handleSaveProfile = async () => {
    if (!onUpdateProfile) return;

    setIsSubmittingProfile(true);

    try {
      await onUpdateProfile({ name: editName, photo: editPhoto });

      if (editPhoto) {
        setLocalAvatarOverride(editPhoto.uri);
      }

      refetch();
      shouldShowProfileUpdatedToast.current = true;
      setEditModalVisible(false);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Não foi possível salvar o perfil. Tente novamente.',
      });
    } finally {
      setIsSubmittingProfile(false);
    }
  };

  const handleOpenPasswordModal = () => {
    setPasswordModalVisible(true);
  };

  const resetPasswordForm = () => {
    setPasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setArePasswordsVisible(false);
  };

  const handleClosePasswordModal = () => {
    if (isSubmittingPassword) return;
    resetPasswordForm();
  };

  const handleSavePassword = async () => {
    if (!canSavePassword || !onChangePassword) return;

    setIsSubmittingPassword(true);

    try {
      await onChangePassword({ password: currentPassword, newPassword });
      shouldShowPasswordChangedToast.current = true;
      resetPasswordForm();
    } catch (error) {
      const isWrongCurrentPassword = error instanceof ApiError && error.status === 400;

      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: isWrongCurrentPassword
          ? 'Senha atual incorreta.'
          : 'Não foi possível alterar a senha. Tente novamente.',
      });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleOpenLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  const handleCloseLogoutModal = () => {
    if (isLoggingOut) return;
    setLogoutModalVisible(false);
  };

  const handleConfirmLogout = async () => {
    if (!onLogout) return;

    setIsLoggingOut(true);

    try {
      await onLogout();
      setLogoutModalVisible(false);
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Não foi possível sair da conta. Tente novamente.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (!userId) {
    return null;
  }

  return (
    <>
      <ScreenFrame
        gap="lg"
        footer={<NavigationBar groupId={groupId ?? ''} />}
        testID="user-profile-screen"
      >
        <View className="flex-row items-center gap-4">
          <BackButton testID="user-profile-back-button" />
          <Text
            accessibilityRole="header"
            className="flex-1 font-poppins-semibold text-2xl text-ink"
            testID="user-profile-title"
          >
            Perfil
          </Text>
        </View>

        <View className="flex-row items-center justify-center">
          <ProfileCard
            avatarUrl={avatarSource}
            avatarCachePolicy="none"
            completedEventsCount={profile?.completedEventsCount ?? 0}
            pendingEventsCount={profile?.pendingEventsCount ?? 0}
          />
        </View>

        <View className="m-6">
          <ProfileHeading
            isLoading={isLoading}
            error={error}
            name={profile?.name}
          />
          <Text
            className="text-center font-poppins text-sm"
            style={{ color: theme.colors.wine }}
            testID="user-profile-screen-date"
          >
            no alibe desde {profile?.created_at}
          </Text>
        </View>

        {isOwnProfile && (
          <View className="gap-4">
            <ProfileMenuButton
              icon="person-outline"
              label="Editar perfil"
              onPress={handleOpenEditModal}
              testID="user-profile-edit-button"
            />
            <ProfileMenuButton
              icon="lock-closed-outline"
              label="Alterar Senha"
              onPress={handleOpenPasswordModal}
              testID="user-profile-password-button"
            />
            <ProfileMenuButton
              icon="log-out-outline"
              label="Sair"
              onPress={handleOpenLogoutModal}
              testID="user-profile-logout-button"
            />
          </View>
        )}
      </ScreenFrame>

      <ModalFrame
        visible={isEditModalVisible}
        onRequestClose={handleCloseEditModal}
        title="Editar Perfil"
        testID="user-profile-edit-modal"
      >
        <PhotoPicker
          key={editModalKey}
          label=""
          initialPhotoUri={profile?.photoUri ?? null}
          onUploadSuccess={setEditPhoto}
          disabled={isSubmittingProfile}
          testID="user-profile-edit-photo"
        />

        <View className="mt-4 gap-3">
          <TextInput
            value={editName}
            onChangeText={setEditName}
            placeholder="Seu nome"
            disabled={isSubmittingProfile}
            testID="user-profile-edit-name"
          />
        </View>

        <View className="mt-4 flex-row gap-4">
          <TouchableOpacity
            onPress={handleCloseEditModal}
            disabled={isSubmittingProfile}
            className="flex-1 items-center justify-center rounded-full border-2 border-coral py-4"
            testID="user-profile-edit-cancel"
          >
            <Text className="font-poppins-semibold leading-none text-coral">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              void handleSaveProfile();
            }}
            disabled={isSubmittingProfile}
            className={`flex-1 items-center justify-center rounded-full bg-coral py-4 ${
              isSubmittingProfile ? 'opacity-60' : ''
            }`}
            testID="user-profile-edit-save"
          >
            <Text className="font-poppins-semibold leading-none text-surface">
              {isSubmittingProfile ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ModalFrame>

      <ModalFrame
        visible={isPasswordModalVisible}
        onRequestClose={handleClosePasswordModal}
        title="Alterar Senha"
        testID="user-profile-password-modal"
      >
        <View className="gap-3">
          <PasswordInput
            label="Senha Atual"
            variant="password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            visible={arePasswordsVisible}
            disabled={isSubmittingPassword}
            testID="user-profile-current-password"
          />
          <PasswordInput
            label="Nova Senha"
            variant="password"
            value={newPassword}
            onChangeText={setNewPassword}
            visible={arePasswordsVisible}
            disabled={isSubmittingPassword}
            error={
              newPasswordTooShort
                ? `A senha deve ter pelo menos ${String(MIN_PASSWORD_LENGTH)} caracteres.`
                : undefined
            }
            testID="user-profile-new-password"
          />
          <PasswordInput
            label="Confirmar Nova Senha"
            variant="confirm"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            visible={arePasswordsVisible}
            disabled={isSubmittingPassword}
            error={passwordsMismatch ? 'As senhas não coincidem.' : undefined}
            testID="user-profile-confirm-password"
          />

          <View className="flex-row px-4">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={arePasswordsVisible ? 'Ocultar senha' : 'Mostrar senha'}
              className="flex-row items-center gap-2"
              hitSlop={8}
              style={({ pressed }) => tw`${pressed ? 'opacity-60' : 'opacity-100'}`}
              onPress={() => {
                setArePasswordsVisible((current) => !current);
              }}
              testID="user-profile-toggle-password"
            >
              <Ionicons
                name={arePasswordsVisible ? 'eye-outline' : 'eye-off-outline'}
                size={18}
                color={theme.colors.wine}
              />
              <Text className="font-poppins text-sm text-wine">
                {arePasswordsVisible ? 'Ocultar' : 'Mostrar'}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-2 flex-row gap-4">
          <TouchableOpacity
            onPress={handleClosePasswordModal}
            disabled={isSubmittingPassword}
            className="flex-1 items-center justify-center rounded-full border-2 border-coral py-4"
            testID="user-profile-password-cancel"
          >
            <Text className="font-poppins-semibold leading-none text-coral">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              void handleSavePassword();
            }}
            disabled={!canSavePassword}
            accessibilityState={{ disabled: !canSavePassword }}
            className={`flex-1 items-center justify-center rounded-full bg-coral py-4 ${
              canSavePassword ? '' : 'opacity-60'
            }`}
            testID="user-profile-password-save"
          >
            <Text className="font-poppins-semibold leading-none text-surface">
              {isSubmittingPassword ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>
      </ModalFrame>

      <ModalFrame
        visible={isLogoutModalVisible}
        onRequestClose={handleCloseLogoutModal}
        title="Sair da conta"
        testID="user-profile-logout-modal"
      >
        <Text className="text-center font-poppins text-base text-wine">
          Tem certeza de que deseja sair da sua conta?
        </Text>

        <View className="mt-2 flex-row gap-4">
          <TouchableOpacity
            onPress={handleCloseLogoutModal}
            disabled={isLoggingOut}
            className="flex-1 items-center justify-center rounded-full border-2 border-coral py-4"
            testID="user-profile-logout-cancel"
          >
            <Text className="font-poppins-semibold leading-none text-coral">Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              void handleConfirmLogout();
            }}
            disabled={isLoggingOut}
            className={`flex-1 items-center justify-center rounded-full bg-coral py-4 ${
              isLoggingOut ? 'opacity-60' : ''
            }`}
            testID="user-profile-logout-confirm"
          >
            <Text className="font-poppins-semibold leading-none text-surface">
              {isLoggingOut ? 'Saindo...' : 'Sair'}
            </Text>
          </TouchableOpacity>
        </View>
      </ModalFrame>
    </>
  );
};
