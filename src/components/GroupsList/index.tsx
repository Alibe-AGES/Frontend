import { GroupCard } from '@/components/GroupCard';
import { useGroups } from '@/hooks/useGroups';
import { theme } from '@/theme';
import { FC } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import tw from 'twrnc';
import { GroupsListProps } from './GroupsList.types';

export type { GroupsListProps } from './GroupsList.types';

export const GroupsList: FC<GroupsListProps> = ({ onGroupPress, testID = 'alibe-groups-list' }) => {
  const { groups, isLoading, isRefreshing, error, refetch } = useGroups();

  if (isLoading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        testID={`${testID}-loading`}
      >
        <ActivityIndicator color={theme.colors.ink} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        className="items-center justify-center gap-3 rounded-3xl bg-surface p-6"
        testID={`${testID}-error`}
      >
        <Text className="text-center font-poppins text-sm text-ink-soft">{error}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          onPress={() => {
            void refetch();
          }}
          style={({ pressed }) => tw`${pressed ? 'opacity-75' : 'opacity-100'}`}
          className="rounded-full bg-ink px-5 py-2"
        >
          <Text className="font-poppins-semibold text-sm text-white">Tentar novamente</Text>
        </Pressable>
      </View>
    );
  }

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
          onRefresh={() => {
            void refetch();
          }}
          tintColor={theme.colors.ink}
        />
      }
      testID={testID}
    />
  );
};
