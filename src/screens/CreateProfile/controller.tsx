import { CreateProfileScreen } from '@/screens/CreateProfile';
import { useRouter } from 'expo-router';

export default function CreateProfileController() {
  const router = useRouter();

  // O perfil ainda não é enviado ao backend; o envio entra na task de integração do cadastro.
  const handleContinue = () => {
    router.replace('/groups');
  };

  return <CreateProfileScreen onContinue={handleContinue} />;
}
