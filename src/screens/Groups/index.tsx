import { CreateGroupButton } from '@/components/CreateGroupButton';
import { GroupsList } from '@/components/GroupsList';
import { ProfileButton } from '@/components/ProfileButton';
import { usePendingInvite } from '@/hooks/usePendingInvite';
import { ApiError } from '@/server/api';
import { joinGroupByInvite, listGroups } from '@/server/groups';
import { theme } from '@/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import Toast from 'react-native-toast-message';

import GroupSpin from '@/assets/images/group-spin-dark-green.svg';
import PinkSpin from '@/assets/images/pink-spin.svg';

export function GroupsScreen() {
  const router = useRouter();
  const { invite } = useLocalSearchParams<{ invite?: string }>();
  const { getPendingInvite, setPendingInvite } = usePendingInvite();
  const handledToken = useRef<string | null>(null);
  const [groupsListVersion, setGroupsListVersion] = useState(0);

  useEffect(() => {
    // Convite da URL ou guardado antes do login/cadastro.
    const token = invite ?? getPendingInvite();

    if (!token || handledToken.current === token) {
      return;
    }

    handledToken.current = token;

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

        await joinGroupByInvite(token);
        setPendingInvite(null);
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
      } catch (error) {
        // Sem sessão: guarda o convite para usar depois do login ou cadastro.
        if (error instanceof ApiError && error.status === 401) {
          setPendingInvite(token);
          router.replace('/auth');
          return;
        }

        setPendingInvite(null);
        Toast.show({
          type: 'error',
          text1: 'Não foi possível aceitar o convite',
          text2: 'O link pode ser inválido ou ter expirado.',
        });
      }

      router.replace('/groups');
    };

    void joinGroup();
  }, [invite, router, getPendingInvite, setPendingInvite]);

  const handleCreateGroup = () => {
    router.push('/create-group');
  };

  const handleGroupPress = (id: string) => {
    router.push({ pathname: '/group/[id]', params: { id } });
  };

  const handleInfoGroupPress = (id: string) => {
    router.push({ pathname: '/group/[id]/info', params: { id } });
  };

  return (
    <View
      className="relative flex-1 overflow-hidden bg-canvas px-12"
      testID="groups-screen"
    >
      <ProfileButton
        className="absolute right-6 top-16 z-10 h-12 w-12 items-center justify-center"
        testID="groups-user-profile"
      />
      <View
        accessible={false}
        className="absolute -left-3 -top-2 h-40 w-40 sm:h-40 sm:w-40"
      >
        <PinkSpin
          width="100%"
          height="100%"
        />
      </View>

      <View
        accessible={false}
        className="sm:w-15 absolute -bottom-3 -right-3 h-40 w-40 rotate-180 sm:h-32"
      >
        <PinkSpin
          width="100%"
          height="100%"
        />
      </View>

      <View className="mt-28 w-full max-w-2xl flex-1 gap-6 self-center">
        <View className="items-center">
          <View
            accessibilityLabel="Logo Alibe"
            className="h-32 w-32 max-w-24"
          >
            <GroupSpin
              width="100%"
              height="100%"
            />
          </View>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            className={`text-center text-[2.3rem] leading-tight text-ink ${theme.typography.display}`}
          >
            Meus grupos
          </Text>

          <Text className={`mt-2 text-center text-wine ${theme.typography.body}`}>
            Clique no + para criar um novo grupo.
          </Text>
        </View>

        <View className="flex-1 gap-6">
          <View className="items-center">
            <CreateGroupButton onPress={handleCreateGroup} />
          </View>

          <GroupsList
            key={groupsListVersion}
            onGroupPress={handleGroupPress}
            onInfoGroupPress={handleInfoGroupPress}
          />
        </View>
      </View>
    </View>
  );
}
