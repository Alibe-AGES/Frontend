import { BackButton } from '@/components/BackButton';
import { NavigationBar } from '@/components/NavigationBar';
import { PasswordInput } from '@/components/PasswordInput';
import { PhotoPicker } from '@/components/PhotoPicker';
import { ProfileCard } from '@/components/ProfileCard';
import { TextInput } from '@/components/TextInput';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ProfileMenuButton = ({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    className="w-full flex-row items-center rounded-full border bg-surface p-2"
    style={{ borderColor: theme.colors.ink }}
    activeOpacity={0.7}
  >
    <View className="mr-4 h-10 w-10 items-center justify-center rounded-full border bg-coral">
      <Ionicons name={icon} size={20} color={theme.colors.surface} />
    </View>
    <Text
      className="flex-1 font-poppins text-lg"
      style={{ color: theme.colors.wine }}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default function UserProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [isPasswordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isEditModalVisible, setEditModalVisible] = useState(false);
  const [editName, setEditName] = useState('Ellen Vitória');
  const [editPhoto, setEditPhoto] = useState<any>(null);
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

  const handleOpenEditModal = () => setEditModalVisible(true);
  
  const handleCloseEditModal = () => {
    setEditModalVisible(false);
    setEditName('Ellen Vitória');
    setEditPhoto(null);
  };

  const handleSaveProfile = async () => {
    setIsSubmittingProfile(true);

    console.log('Salvando perfil. Nome:', editName, 'Foto:', editPhoto);
    
    setTimeout(() => {
      setIsSubmittingProfile(false);
      setEditModalVisible(false);
    }, 1000);
  };

  const handleOpenPasswordModal = () => setPasswordModalVisible(true);

  const handleClosePasswordModal = () => {
    setPasswordModalVisible(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleSavePassword = () => {
    console.log('Senha atual:', currentPassword);
    console.log('Nova senha:', newPassword);
    handleClosePasswordModal();
  };

  return (
    <View className="flex-1 bg-canvas">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-32 pt-16"
        testID="user-profile-screen"
      >
        <BackButton color={theme.colors.black} />

        <View className="flex-row items-center justify-center">
          <ProfileCard completedEventsCount={24} pendingEventsCount={2} />
        </View>

        <View className="m-6">
          <Text
            className="text-center font-poppins-semibold text-2xl"
            style={{ color: theme.colors.wine }}
            testID="user-profile-screen-name"
          >
            Ellen Vitória
          </Text>
          <Text
            className="text-center font-poppins text-sm"
            style={{ color: theme.colors.wine }}
            testID="user-profile-screen-date"
          >
            no alibe desde abril de 2025
          </Text>
        </View>

        <View className="gap-4">
          <ProfileMenuButton
            icon="person-outline"
            label="Editar perfil"
            onPress={handleOpenEditModal}
          />
          <ProfileMenuButton
            icon="lock-closed-outline"
            label="Senha"
            onPress={handleOpenPasswordModal}
          />
        </View>
      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCloseEditModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 items-center justify-center bg-black/50 px-6">
            <View className="w-full gap-5 rounded-3xl bg-canvas p-6 shadow-lg">
              <Text className="text-center font-poppins-semibold text-xl text-wine">
                Editar Perfil
              </Text>

              <PhotoPicker
              label=''
                onUploadSuccess={(photo) => setEditPhoto(photo)}
                disabled={isSubmittingProfile}
              />

              <View className="gap-3 mt-4">
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Seu nome"
                  disabled={isSubmittingProfile}
                />
              </View>

              <View className="mt-4 flex-row gap-4">
                <TouchableOpacity
                  onPress={handleCloseEditModal}
                  disabled={isSubmittingProfile}
                  className="flex-1 items-center justify-center rounded-full border-2 border-coral py-3"
                >
                  <Text className="font-poppins-semibold text-coral">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSaveProfile}
                  disabled={isSubmittingProfile}
                  className={`flex-1 items-center justify-center rounded-full bg-coral py-3 ${isSubmittingProfile ? 'opacity-60' : ''}`}
                >
                  <Text className="font-poppins-semibold text-surface">
                    {isSubmittingProfile ? 'Salvando...' : 'Salvar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={isPasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClosePasswordModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 items-center justify-center bg-black/50 px-6">
            <View className="w-full gap-5 rounded-3xl bg-canvas p-6 shadow-lg">
              <Text className="text-center font-poppins-semibold text-xl text-wine">
                Alterar Senha
              </Text>

              <View className="gap-3">
                <PasswordInput
                  label="Senha Atual"
                  variant="password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <PasswordInput
                  label="Nova Senha"
                  variant="password"
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <PasswordInput
                  label="Confirmar Nova Senha"
                  variant="confirm"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>

              <View className="mt-2 flex-row gap-4">
                <TouchableOpacity
                  onPress={handleClosePasswordModal}
                  className="flex-1 items-center justify-center rounded-full border-2 border-coral py-3"
                >
                  <Text className="font-poppins-semibold text-coral">Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSavePassword}
                  className="flex-1 items-center justify-center rounded-full bg-coral py-3"
                >
                  <Text className="font-poppins-semibold text-surface">Salvar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View
        className="absolute inset-x-0 bottom-0"
        style={{ paddingBottom: insets.bottom }}
      >
        <NavigationBar groupId="123" />
      </View>
    </View>
  );
}