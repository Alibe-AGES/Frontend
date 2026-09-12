import { CreateGroupButton } from '@/components/CreateGroupButton';
import { GroupsList } from '@/components/GroupsList';
import { theme } from '@/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import greenSpin from '@/assets/images/green-spin.svg';
import groupSpin from '@/assets/images/group-spin.svg';
import pinkSpin from '@/assets/images/pink-spin.svg';

export function GroupsScreen() {
  const router = useRouter();

  const handleCreateGroup = () => {
    router.push('/create-group');
  };

  const handleGroupPress = (id: string) => {
    router.push({ pathname: '/group/[id]', params: { id } });
  };

  return (
    <View className="relative flex-1 overflow-hidden bg-canvas px-12">
      <Image
        source={pinkSpin}
        contentFit="contain"
        accessible={false}
        className="absolute -left-3 -top-2 h-32 w-32 sm:h-40 sm:w-40"
      />
      <Image
        source={greenSpin}
        contentFit="contain"
        accessible={false}
        className="absolute -bottom-5 -left-13 h-32 w-32 sm:h-36 sm:w-36"
      />
      <Image
        source={pinkSpin}
        contentFit="contain"
        accessible={false}
        className="absolute -right-3 -bottom-3 h-32 w-32 sm:h-32 sm:w-15 rotate-180"
      />

      <View className="w-full max-w-2xl flex-1 gap-6 self-center px-6 pb-6 pt-10">
        <View className="items-center gap-2">
          <Image
            source={groupSpin}
            contentFit="contain"
            accessibilityLabel="Logo Alibe"
            className="h-32 w-32"
          />

          <Text className={`text-center text-3xl text-ink ${theme.typography.display}`}>
            Meus grupos
          </Text>
          <Text className={`text-center text-wine ${theme.typography.body}`}>
            Clique no + para criar um novo grupo.
          </Text>
          <CreateGroupButton onPress={handleCreateGroup} />
        </View>

        <GroupsList onGroupPress={handleGroupPress} />
      </View>
    </View>
  );
}
