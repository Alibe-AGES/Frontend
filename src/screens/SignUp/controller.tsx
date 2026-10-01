import { SignUpScreen, type SignUpData } from '@/screens/SignUp';
import { useRouter } from 'expo-router';

export default function SignUpController() {
  const router = useRouter();

  const handleContinue = ({ email, password }: SignUpData) => {
    router.push({ pathname: '/profile', params: { email, password } });
  };

  return <SignUpScreen onContinue={handleContinue} />;
}
