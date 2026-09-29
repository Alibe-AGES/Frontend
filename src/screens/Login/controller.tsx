import { LoginScreen } from '@/screens/Login';
import { useRouter } from 'expo-router';

export default function LoginController() {
  const router = useRouter();

  const handleContinue = () => {
    router.replace('/groups');
  };

  const handleBack = () => {
    router.dismissTo('/auth');
  };

  return (
    <LoginScreen
      onContinue={handleContinue}
      onBack={handleBack}
    />
  );
}
