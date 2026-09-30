import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import FriendsIcon from '@/assets/images/auth-friends-icon.svg';
import HandsDecoration from '@/assets/images/auth-hands-decoration.svg';
import { Button } from '@/components/Button';
import { theme } from '@/theme';

const HEADLINE = 'Encontrar os amigos não precisa ser um desafio';

export function AuthScreen() {
  const router = useRouter();

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[tw`flex-1`, { backgroundColor: theme.colors.surface }]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow pt-10"
        testID="auth-screen"
      >
        <View className="grow justify-center">
          <View
            accessible
            accessibilityRole="header"
            accessibilityLabel={HEADLINE}
            className="w-full max-w-md items-center self-center px-4"
          >
            <View className="flex-row items-end">
              <View className="-rotate-3 rounded-full bg-lime-soft px-5 py-2">
                <Text className="font-poppins-medium text-[2.75rem] leading-[3.75rem] text-ink">
                  Encontrar
                </Text>
              </View>
              <Text className="-ml-4 translate-y-2 font-poppins text-3xl text-ink">os</Text>
            </View>
            <Text className="-mb-2 font-poppins-black text-[4.75rem] leading-[6rem] text-ink">
              amigos
            </Text>
            <Text className="font-poppins text-3xl text-ink">não precisa ser um</Text>
            <View className="mt-2 flex-row items-center">
              <View
                accessible={false}
                className="h-16 w-16"
              >
                <FriendsIcon
                  width="100%"
                  height="100%"
                />
              </View>
              <View
                className="ml-2 rotate-2 rounded-full px-8 py-2"
                style={{ backgroundColor: theme.colors.pink }}
              >
                <Text className="font-poppins text-[2.5rem] leading-[3.5rem] text-ink">
                  desafio
                </Text>
              </View>
            </View>
          </View>

          <View
            accessible={false}
            className="-mt-4 aspect-[390/280] w-full"
            testID="auth-illustration"
          >
            <HandsDecoration
              width="100%"
              height="100%"
            />
          </View>
        </View>

        <View className="gap-3 px-12 pb-28">
          <Button
            title="Login"
            onPress={() => {
              router.push('/login');
            }}
            testID="auth-login"
          />
          <Button
            title="Criar conta"
            onPress={() => {
              router.push('/sign-up');
            }}
            testID="auth-sign-up"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
