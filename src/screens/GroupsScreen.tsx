import { CreateGroupButton } from '@/components/CreateGroupButton';
import { GroupsList } from '@/components/GroupsList';
import { theme } from '@/theme';
import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

export function GroupsScreen() {
  const router = useRouter();

  const handleCreateGroup = () => {
    router.push('/create-group');
  };

  const handleGroupPress = (id: string) => {
    router.push({ pathname: '/group/[id]', params: { id } });
  };

  return (
    <View className="flex-1 gap-6 bg-canvas px-6 pb-6 pt-10">
      <View className="items-center gap-2">
        <Text className={`text-center text-3xl text-ink ${theme.typography.display}`}>
          Meus grupos
        </Text>
        <Text className={`text-center text-ink-soft ${theme.typography.body}`}>
          Clique no + para criar um novo grupo.
        </Text>
        <CreateGroupButton onPress={handleCreateGroup} />
      </View>

      <GroupsList onGroupPress={handleGroupPress} />
    </View>
  );
}
