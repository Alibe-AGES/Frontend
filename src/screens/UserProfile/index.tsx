import { BackButton } from '@/components/BackButton';
import { NavigationBar } from '@/components/NavigationBar';
import { ProfileCard } from '@/components/ProfileCard';
import { theme } from '@/theme';
import { ScrollView, Text, View } from 'react-native';

export default function UserProfileScreen() {
  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: '#FFFBF6' }}
      contentContainerClassName="gap-6 px-6 py-16"
      testID="user-profile-screen"
    >
      <BackButton color={theme.colors.black} />

      <View className="flex-row items-center justify-center gap-10">
        <ProfileCard
          completedEventsCount={24}
          pendingEventsCount={2}
        ></ProfileCard>
      </View>
      <View>
        <Text
          className="text-center font-poppins-medium text-xl"
          style={{ color: theme.colors.wine }}
          testID="user-profile-screen-heading"
        >
          FULANO
        </Text>
        <Text
          className="text-center font-poppins text-lg"
          style={{ color: theme.colors.wine }}
          testID="user-profile-screen-heading"
        >
          no alibe desde 2025
        </Text>
      </View>
      <NavigationBar groupId="123"></NavigationBar>
    </ScrollView>
  );
}
