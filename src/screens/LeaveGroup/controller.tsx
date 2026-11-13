import { LeaveGroupScreen } from '@/screens/LeaveGroup';
import { getGroup, leaveGroup } from '@/server/groups';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

export default function LeaveGroupController() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();
  const [groupName, setGroupName] = useState<string | undefined>(undefined);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!groupId) {
      return;
    }

    // Best effort: without the name the dialog falls back to the generic message.
    getGroup(groupId)
      .then((group) => {
        setGroupName(group.name);
      })
      .catch(() => {
        setGroupName(undefined);
      });
  }, [groupId]);

  const handleCancel = () => {
    if (isLeaving) {
      return;
    }

    if (router.canGoBack()) {
      router.back();
    } else if (groupId) {
      router.replace({ pathname: '/group/[id]', params: { id: groupId } });
    }
  };

  const handleConfirm = async () => {
    if (!groupId || isLeaving) {
      return;
    }

    setIsLeaving(true);

    try {
      await leaveGroup(groupId);
      Toast.show({
        type: 'success',
        text1: 'Pronto!',
        text2: groupName ? `Você saiu do grupo ${groupName}.` : 'Você saiu do grupo.',
      });
      // The group screens are no longer accessible, so drop them from the history. The `left`
      // param tells an already mounted groups list to reload.
      router.dismissTo({ pathname: '/groups', params: { left: groupId } });
    } catch (error) {
      console.error('Erro ao sair do grupo', error);
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível sair do grupo. Tente novamente.',
      });
      setIsLeaving(false);
    }
  };

  return (
    <LeaveGroupScreen
      groupName={groupName}
      isLeaving={isLeaving}
      onConfirm={() => void handleConfirm()}
      onCancel={handleCancel}
    />
  );
}
