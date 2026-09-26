import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import FriendsIcon from '@/assets/images/auth-friends-icon.svg';
import HighFiveIllustration from '@/assets/images/auth-high-five.svg';
import { Button } from '@/components/Button';
import { theme } from '@/theme';

const HEADLINE = 'Encontrar os amigos não precisa ser um desafio';

export function AuthScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={[tw`flex-1`, { backgroundColor: theme.colors.surface }]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow justify-between py-10"
        testID="auth-screen"
      >
        <View
          accessible
          accessibilityRole="header"
          accessibilityLabel={HEADLINE}
          className="w-full max-w-md items-center self-center px-6"
        >
          <View className="flex-row items-end">
            <View className="-rotate-3 rounded-full bg-lime-soft px-6 py-1">
              <Text className="font-poppins-medium text-4xl text-ink">Encontrar</Text>
            </View>
            <Text className="mb-1 ml-2 font-poppins text-2xl text-ink">os</Text>
          </View>
          <Text className="font-poppins-black text-7xl leading-[5.25rem] text-ink">amigos</Text>
          <Text className="font-poppins text-2xl text-ink">não precisa ser um</Text>
          <View className="mt-2 flex-row items-center">
            <View
              accessible={false}
              className="h-12 w-12"
            >
              <FriendsIcon
                width="100%"
                height="100%"
              />
            </View>
            <View className="ml-2 rotate-2 rounded-full bg-pink/60 px-8 py-2">
              <Text className="font-poppins text-4xl text-ink">desafio</Text>
            </View>
          </View>
        </View>

        {/* The aspect ratio matches the viewBox of auth-high-five.svg (520 x 240). */}
        <View
          accessible={false}
          className="my-8 aspect-[13/6] w-full max-w-xl self-center"
          testID="auth-illustration"
        >
          <HighFiveIllustration
            width="100%"
            height="100%"
          />
        </View>

        <View className="w-full max-w-md gap-4 self-center px-10">
          <Button
            title="Login"
            onPress={() => {
              router.push('/login');
            }}
          />
          <Button
            title="Criar conta"
            onPress={() => {
              router.push('/sign-up');
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
