import { useSignUpDraft } from '@/hooks/useSignUpDraft';
import { SignUpScreen, type SignUpData } from '@/screens/SignUp';
import { useRouter } from 'expo-router';

export default function SignUpController() {
  const router = useRouter();
  const { setDraft } = useSignUpDraft();

  const handleContinue = (data: SignUpData) => {
    setDraft(data);
    router.push('/profile');
  };

  return <SignUpScreen onContinue={handleContinue} />;
}
