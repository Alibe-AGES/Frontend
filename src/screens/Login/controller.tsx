import { LoginScreen } from '@/screens/Login';
import { useRouter } from 'expo-router';

export default function LoginController() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace('/groups');
  };

  return <LoginScreen onContinue={handleContinue} />;
}
