import { synchronizePushToken } from '@/notifications/synchronize-push-token';
import { authClient } from '@/server/auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export type GoogleSignInReturnRoute = '/login' | '/sign-up';

export const GOOGLE_SIGN_IN_NOT_COMPLETED_MESSAGE =
  'Não foi possível entrar com o Google. Se este e-mail já tem cadastro, entre com sua senha.';
export const GOOGLE_SIGN_IN_CONNECTION_MESSAGE = 'Não foi possível conectar. Tente novamente.';

export function useGoogleSignIn(returnTo: GoogleSignInReturnRoute) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    setErrorMessage(undefined);
    setIsLoading(true);

    try {
      // O retorno de erro usa a mesma rota: no Android o navegador só fecha com esse prefixo, e
      // a tela atual não exige sessão.
      const { error } = await authClient.signIn.social({
        provider: 'google',
        callbackURL: returnTo,
        errorCallbackURL: returnTo,
      });
      if (error) {
        setErrorMessage(GOOGLE_SIGN_IN_NOT_COMPLETED_MESSAGE);
        return;
      }

      // Cancelamento e erros do callback não chegam como `error`; só a sessão confirma o login.
      const { data: session } = await authClient.getSession();
      if (!session) {
        setErrorMessage(GOOGLE_SIGN_IN_NOT_COMPLETED_MESSAGE);
        return;
      }

      await synchronizePushToken();
      router.replace('/groups');
    } catch (error) {
      console.warn('Não foi possível entrar com o Google.', error);
      setErrorMessage(GOOGLE_SIGN_IN_CONNECTION_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, errorMessage, isLoading };
}
