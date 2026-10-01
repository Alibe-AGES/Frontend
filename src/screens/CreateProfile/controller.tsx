import { CreateProfileScreen, type CreateProfileData } from '@/screens/CreateProfile';
import { signUpWithEmail } from '@/server/auth';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import Toast from 'react-native-toast-message';

export default function CreateProfileController() {
  const router = useRouter();
  const { email, password } = useLocalSearchParams<{ email?: string; password?: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async ({ nickname }: CreateProfileData) => {
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
    } catch {
      setIsSubmitting(false);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível criar sua conta. Tente novamente.',
      });
      return;
    }

    // O login e o upload da foto (PUT /users/me/profile-picture) entram na task de integração do login.
    router.replace('/groups');
  };

  return (
    <CreateProfileScreen
      onContinue={(profile) => void handleContinue(profile)}
      isSubmitting={isSubmitting}
    />
  );
}
