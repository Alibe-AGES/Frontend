import { Avatar } from '@/components/Avatar';
import { FC } from 'react';
import { Pressable, Text, View } from 'react-native';
import tw from 'twrnc';
import { GroupCardProps } from './GroupCard.types';

export type { GroupCardProps } from './GroupCard.types';

export const GroupCard: FC<GroupCardProps> = ({
  id,
  name,
  color,
  photoUri,
  membersPreview,
  onPress,
  testID = 'alibe-group-card',
}) => {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir grupo ${name}`}
      onPress={() => onPress?.(id)}
      style={({ pressed }) => tw`${pressed ? 'opacity-75' : 'opacity-100'}`}
      className="w-full flex-row items-center gap-3 rounded-2xl bg-surface p-3"
      testID={testID}
    >
      <View className="h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-coral">
        <Avatar
          photoUri={photoUri}
          accessibilityLabel={`Foto do grupo ${name}`}
          imageClassName="h-14 w-14 rounded-full"
          iconSize={26}
          testID={`${testID}-avatar`}
        />
      </View>

      <View className="flex-1">
        <Text
          className="font-poppins-semibold text-lg text-wine"
          numberOfLines={1}
          testID={`${testID}-name`}
        >
          {name}
        </Text>

        {membersPreview ? (
          <Text
            className="font-poppins text-sm text-wine"
            numberOfLines={1}
            testID={`${testID}-members`}
          >
            {membersPreview}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
};
