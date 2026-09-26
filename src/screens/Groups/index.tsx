import { CreateGroupButton } from '@/components/CreateGroupButton';
import { GroupsList } from '@/components/GroupsList';
import { joinGroupByInvite, listGroups } from '@/server/groups';
import { theme } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import GreenSpin from '@/assets/images/green-spin.svg';
import GroupSpin from '@/assets/images/group-spin.svg';
import PinkSpin from '@/assets/images/pink-spin.svg';

export function GroupsScreen() {
  const router = useRouter();
  const { invite } = useLocalSearchParams<{ invite?: string }>();
  const handledToken = useRef<string | null>(null);
  const [groupsListVersion, setGroupsListVersion] = useState(0);

  useEffect(() => {
    if (!invite || handledToken.current === invite) {
      return;
    }

    handledToken.current = invite;

    const joinGroup = async () => {
      try {
        let previousGroupIds = new Set<string>();
        let previousGroupsLoaded = false;

        try {
          const previousGroups = await listGroups();
          previousGroupIds = new Set(previousGroups.map((group) => group.id));
          previousGroupsLoaded = true;
        } catch {
          // A entrada no grupo continua mesmo se a listagem inicial falhar.
        }

        await joinGroupByInvite(invite);
        let joinedGroupName: string | undefined;

        try {
          const updatedGroups = await listGroups();
          if (previousGroupsLoaded) {
            joinedGroupName = updatedGroups.find((group) => !previousGroupIds.has(group.id))?.name;
          }
        } catch {
          // A lista será carregada novamente pelo componente após o convite.
        }

        setGroupsListVersion((currentVersion) => currentVersion + 1);
        Toast.show({
          type: 'success',
          text1: 'Convite aceito!',
          text2: joinedGroupName
            ? `Você entrou no grupo ${joinedGroupName} por um link de convite.`
            : 'Você entrou em um grupo por um link de convite.',
        });
      } catch {
        Toast.show({
          type: 'error',
          text1: 'Não foi possível aceitar o convite',
          text2: 'O link pode ser inválido ou ter expirado.',
        });
      } finally {
        router.replace('/groups');
      }
    };

    void joinGroup();
  }, [invite, router]);

  const handleCreateGroup = () => {
    router.push('/create-group');
  };

  const handleGroupPress = (id: string) => {
    router.push({ pathname: '/group/[id]', params: { id } });
  };

  return (
    <View className="relative flex-1 overflow-hidden bg-canvas px-12">
      <View
        accessible={false}
        className="absolute -left-3 -top-2 h-32 w-32 sm:h-40 sm:w-40"
      >
        <PinkSpin
          width="100%"
          height="100%"
        />
      </View>
      <View
        accessible={false}
        className="absolute -bottom-5 -left-8 h-32 w-32 sm:h-36 sm:w-36"
      >
        <GreenSpin
          width="100%"
          height="100%"
        />
      </View>
      <View
        accessible={false}
        className="sm:w-15 absolute -bottom-3 -right-3 h-32 w-32 rotate-180 sm:h-32"
      >
        <PinkSpin
          width="100%"
          height="100%"
        />
      </View>

      <View className="w-full max-w-2xl flex-1 gap-6 self-center px-6 pb-6 pt-10">
        <View className="items-center gap-2">
          <View
            accessibilityLabel="Logo Alibe"
            className="h-32 w-32 max-w-24"
          >
            <GroupSpin
              width="100%"
              height="100%"
            />
          </View>

          <Text className={`text-center text-3xl text-ink ${theme.typography.display}`}>
            Meus grupos
          </Text>
          <Text className={`text-center text-wine ${theme.typography.body}`}>
            Clique no + para criar um novo grupo.
          </Text>
          <CreateGroupButton onPress={handleCreateGroup} />
        </View>

        <GroupsList
          key={groupsListVersion}
          onGroupPress={handleGroupPress}
        />
      </View>
    </View>
  );
}
