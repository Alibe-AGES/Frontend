import { GroupCard } from '@/components/GroupCard';
import { useGroups } from '@/hooks/useGroups';
import { theme } from '@/theme';
import { FC } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { GroupsListProps } from './GroupsList.types';

export type { GroupsListProps } from './GroupsList.types';

export const GroupsList: FC<GroupsListProps> = ({ onGroupPress, testID = 'alibe-groups-list' }) => {
  const { groups, isRefreshing, refetch } = useGroups();

  if (groups.length === 0) {
    return (
      <View
        className="items-center justify-center gap-2 rounded-3xl bg-surface p-6"
        testID={`${testID}-empty`}
      >
        <Text className="text-center font-poppins text-sm text-ink-soft">
          Você ainda não faz parte de nenhum grupo.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      className="flex-1"
      data={groups}
      keyExtractor={(group) => group.id}
      renderItem={({ item }) => (
        <GroupCard
          id={item.id}
          name={item.name}
          color={item.color}
          photoUri={item.photoUri}
          onPress={onGroupPress}
          testID={`${testID}-item-${item.id}`}
        />
      )}
      contentContainerClassName="gap-4"
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refetch}
          tintColor={theme.colors.ink}
        />
      }
      testID={testID}
    />
  );
};
