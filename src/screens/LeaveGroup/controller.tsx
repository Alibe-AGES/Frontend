import { LeaveGroupScreen } from '@/screens/LeaveGroup';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Toast from 'react-native-toast-message';

export default function LeaveGroupController() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  const handleCancel = () => {
    if (router.canGoBack()) {
      router.back();
    } else if (groupId) {
      router.replace({ pathname: '/group/[id]', params: { id: groupId } });
    }
  };

  const handleConfirm = () => {
    Toast.show({
      type: 'info',
      text1: 'Not yet implemented',
      text2: 'A funcionalidade de sair do grupo ainda não está disponível.',
    });
  };

  return (
    <LeaveGroupScreen
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );
}
