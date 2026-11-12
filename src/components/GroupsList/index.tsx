import { GroupCard } from '@/components/GroupCard';
import { TopFade } from '@/components/ScreenFrame/TopFade';
import { useGroups } from '@/hooks/useGroups';
import { theme } from '@/theme';
import { FC, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import tw from 'twrnc';
import { GroupsListProps } from './GroupsList.types';

export type { GroupsListProps } from './GroupsList.types';

export const GroupsList: FC<GroupsListProps> = ({
  onGroupPress,
  onInfoGroupPress,
  testID = 'alibe-groups-list',
}) => {
  const { groups, isLoading, isRefreshing, error, refetch } = useGroups();
  const [scrollOffset] = useState(() => new Animated.Value(0));

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
    <View className="relative flex-1">
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
            membersPreview={item.membersPreview}
            onPress={onGroupPress}
            onInfoPress={onInfoGroupPress}
            testID={`${testID}-item-${item.id}`}
          />
        )}
        contentContainerClassName="gap-4 pb-12"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => {
              void refetch();
            }}
            tintColor={theme.colors.ink}
          />
        }
        onScroll={(event) => {
          scrollOffset.setValue(event.nativeEvent.contentOffset.y);
        }}
        // iOS otherwise reports only the first scroll event, leaving the fade half revealed.
        scrollEventThrottle={16}
        testID={testID}
      />

      {/* Cards dissolve into the canvas at the list's top edge instead of being cut off. */}
      <TopFade
        color={theme.colors.canvas}
        scrollOffset={scrollOffset}
        solidHeight={0}
      />
    </View>
  );
};
