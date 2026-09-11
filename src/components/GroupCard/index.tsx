import { Avatar } from '@/components/Avatar';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
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
  onPress,
  testID = 'alibe-group-card',
}) => {
  const textColor = color === 'bg-coral' ? 'text-white' : 'text-ink';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Abrir grupo ${name}`}
      onPress={() => onPress?.(id)}
      style={({ pressed }) => tw`${pressed ? 'opacity-75' : 'opacity-100'}`}
      className={`w-full flex-row items-center gap-3 rounded-full py-1.5 pl-1.5 pr-5 ${color}`}
      testID={testID}
    >
      <View className="h-12 w-12 items-center justify-center rounded-full bg-white">
        <Avatar
          photoUri={photoUri}
          accessibilityLabel={`Foto do grupo ${name}`}
          imageClassName="h-12 w-12 rounded-full"
          iconSize={24}
          testID={`${testID}-avatar`}
        />
      </View>

      <Text
        className={`flex-1 font-poppins-medium text-base ${textColor}`}
        numberOfLines={1}
        testID={`${testID}-name`}
      >
        {name}
      </Text>

      <Ionicons
        name="information-circle-outline"
        size={24}
        color={theme.colors.white}
        testID={`${testID}-info-icon`}
      />
    </Pressable>
  );
};
