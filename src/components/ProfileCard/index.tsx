import { theme } from '@/theme';
import { FC } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';
import { Avatar } from '../Avatar';
import { ProfileCardProps } from './ProfileCard.types';

export const ProfileCard: FC<ProfileCardProps> = ({
  avatarUrl,
  completedEventsCount,
  pendingEventsCount,
  className = '',
  testID = 'alibe-profile-card',
}) => {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const calculatedSize = Math.min(screenWidth, screenHeight) * 0.28;
  const avatarSize = Math.min(calculatedSize, 120);

  const topOverlap = avatarSize * 0.3;

  return (
    <View
      className={`w-full items-center ${className}`}
      style={{ paddingTop: topOverlap }}
      testID={testID}
    >
      <View
        className="w-full flex-row items-center rounded-3xl bg-lime py-4 shadow-md"
        style={{ minHeight: avatarSize * 0.75 }}
      >
        <View className="flex-1 items-center justify-center px-2">
          <Text
            className="font-poppins-black text-lg text-ink"
            testID={`${testID}-completed-count`}
          >
            {completedEventsCount}
          </Text>
          <Text className="text-center font-poppins text-xs text-ink">{'Eventos\nrealizados'}</Text>
        </View>

        <View style={{ width: avatarSize * 0.9 }} />

        <View className="flex-1 items-center justify-center px-2">
          <Text
            className="font-poppins-black text-lg text-ink"
            testID={`${testID}-pending-count`}
          >
            {pendingEventsCount}
          </Text>
          <Text className="text-center font-poppins text-xs text-ink">{'Eventos\nem decisão'}</Text>
        </View>
      </View>

      <View
        className="items-center justify-center overflow-hidden rounded-full border-4"
        style={{
          position: 'absolute',
          top: 0,
          left: '50%',
          transform: [{ translateX: -avatarSize / 2 }],
          width: avatarSize,
          height: avatarSize,
          borderColor: theme.colors.canvas,
          backgroundColor: theme.colors.surface,
        }}
        testID={`${testID}-avatar`}
      >
        <Avatar
          photoUri={avatarUrl}
          accessibilityLabel="Foto de perfil"
          imageClassName="w-full h-full"
          iconSize={avatarSize * 0.45}
          testID={`${testID}-avatar`}
        />
      </View>
    </View>
  );
};
