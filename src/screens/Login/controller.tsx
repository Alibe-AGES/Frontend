import { LoginScreen } from '@/screens/Login';
import { authClient } from '@/server/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function LoginController() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async ({ email, password }: { email: string; password: string }) => {
    setErrorMessage(undefined);
    setIsSubmitting(true);

    try {
      const { error } = await authClient.signIn.email({ email, password });
      if (error) {
        setErrorMessage('Não foi possível entrar. Confira seu e-mail e senha.');
        return;
      }

      router.replace('/groups');
    } catch {
      setErrorMessage('Não foi possível conectar. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginScreen
      onContinue={handleContinue}
      errorMessage={errorMessage}
      isLoading={isSubmitting}
    />
  );
}
