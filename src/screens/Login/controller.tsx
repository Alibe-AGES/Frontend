import { LoginScreen, type LoginData } from '@/screens/Login';
import { authClient } from '@/server/auth-client';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function LoginController() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async ({ email, password }: LoginData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.email({
        email: email.toLowerCase(),
        password,
        rememberMe: true,
      });

      if (result.error) {
        setError(result.error.message ?? 'E-mail ou senha inválidos.');
        return;
      }

      router.replace('/groups');
    } catch {
      setError('Não foi possível conectar ao servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <LoginScreen
      onContinue={handleContinue}
      error={error}
      isSubmitting={isSubmitting}
    />
  );
}
