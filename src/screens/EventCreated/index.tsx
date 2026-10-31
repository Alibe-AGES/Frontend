import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import tw from 'twrnc';

import HandsDecoration from '@/assets/images/hands-green.svg';
import Logo from '@/assets/images/Logo.svg';
import { Button } from '@/components/Button';
import { theme } from '@/theme';

const HEADLINE = 'Evento confirmado, vocês tem um álibi!';
const STAR_HINT = 'Esse evento aparecerá no calendário sinalizado por uma estrela!';

function StarIcon() {
  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
    >
      <Path
        d="M12 2.5l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5z"
        stroke={theme.colors.lime}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function EventCreatedScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  function handleBackToGroup() {
    router.dismissTo({ pathname: '/group/[id]', params: { id: groupId } });
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[tw`flex-1`, { backgroundColor: theme.colors.surface }]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        testID="event-created-screen"
      >
        <View
          accessible={false}
          className="-mb-24 aspect-[390/381]"
          testID="event-created-illustration"
        >
          <HandsDecoration
            width="100%"
            height="100%"
          />
        </View>

        <View className="grow items-center justify-center px-8">
          <View
            accessible
            accessibilityRole="image"
            accessibilityLabel="Alibe"
            className="aspect-[269/133] w-64"
            testID="event-created-logo"
          >
            <Logo
              width="100%"
              height="100%"
            />
          </View>

          <Text
            accessibilityRole="header"
            accessibilityLabel={HEADLINE}
            className="mt-2 text-center font-poppins-medium text-2xl leading-8 text-ink"
          >
            {'Evento confirmado,\nvocês tem um álibi!'}
          </Text>

          <View
            accessible
            accessibilityLabel={STAR_HINT}
            className="mt-12 w-full max-w-sm flex-row items-center"
            testID="event-created-hint"
          >
            <View className="z-10 h-12 w-12 items-center justify-center rounded-full bg-ink p-2">
              <StarIcon />
            </View>
            <View className="-ml-6 flex-1 rounded-full bg-coral py-3 pl-10 pr-5">
              <Text className="font-poppins text-xs leading-5 text-white">{STAR_HINT}</Text>
            </View>
          </View>
        </View>

        <View className="px-12 pb-10 pt-8">
          <Button
            title="Voltar a tela inicial"
            variant="tertiary"
            onPress={handleBackToGroup}
            testID="event-created-back-home"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
