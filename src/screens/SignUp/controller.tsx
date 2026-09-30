import { SignUpScreen } from '@/screens/SignUp';
import { useRouter } from 'expo-router';

export default function SignUpController() {
  const router = useRouter();

  // A conta ainda não é criada no backend e o e-mail não é checado; isso entra na task de integração do cadastro.
  const handleContinue = () => {
    router.push('/profile');
  };

  return <SignUpScreen onContinue={handleContinue} />;
}
