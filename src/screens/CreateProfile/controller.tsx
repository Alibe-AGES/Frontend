import { CreateProfileScreen, type CreateProfileData } from '@/screens/CreateProfile';
import { authClient } from '@/server/auth-client';
import { signUpWithEmail } from '@/server/auth';
import { updateUserProfilePicture } from '@/server/users';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

export default function CreateProfileController() {
  const router = useRouter();
  const { email, password } = useLocalSearchParams<{ email?: string; password?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async ({ nickname, photo }: CreateProfileData) => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Informe seu email e senha novamente.',
      });
      router.replace('/sign-up');
      return;
    }

    setIsSubmitting(true);

    try {
      await signUpWithEmail({ name: nickname, email, password });

      const loginResult = await authClient.signIn.email({
        email,
        password,
        rememberMe: true,
      });

      if (loginResult.error) {
        throw new Error(loginResult.error.message ?? 'Não foi possível iniciar a sessão.');
      }

      if (photo) {
        await updateUserProfilePicture(photo);
      }

      router.replace('/groups');
    } catch {
      setIsSubmitting(false);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível concluir seu cadastro. Tente novamente.',
      });
    }
  };

  return (
    <CreateProfileScreen
      onContinue={(profile) => void handleContinue(profile)}
      isSubmitting={isSubmitting}
    />
  );
}
