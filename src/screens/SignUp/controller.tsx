import { useGoogleSignIn } from '@/hooks/useGoogleSignIn';
import { useSignUpDraft } from '@/hooks/useSignUpDraft';
import { SignUpScreen, type SignUpData } from '@/screens/SignUp';
import { useRouter } from 'expo-router';

export default function SignUpController() {
  const router = useRouter();
  const { setDraft } = useSignUpDraft();
  // O Google já informa o nome; a conta é criada no primeiro acesso, sem a etapa de perfil.
  const google = useGoogleSignIn('/sign-up');

  const handleContinue = (data: SignUpData) => {
    setDraft(data);
    router.push('/profile');
  };

  return (
    <SignUpScreen
      onContinue={handleContinue}
      onGoogleSignUp={() => {
        void google.signInWithGoogle();
      }}
      errorMessage={google.errorMessage}
      isGoogleLoading={google.isLoading}
    />
  );
}
