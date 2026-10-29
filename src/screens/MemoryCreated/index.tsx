import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import HandsDecoration from '@/assets/images/auth-hands-decoration.svg';
import SpinDecoration from '@/assets/images/pink-spin.svg';
import { Button } from '@/components/Button';
import { theme } from '@/theme';

const HEADLINE = 'Memória adicionada!';
const DESCRIPTION = 'Volte a galeria de memórias para conferir!';

export function MemoryCreatedScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  function handleBackToMemories() {
    router.dismissTo({ pathname: '/group/[id]/memories', params: { id: groupId } });
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right', 'bottom']}
      style={[tw`flex-1`, { backgroundColor: theme.colors.surface }]}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow"
        testID="memory-created-screen"
      >
        <View
          accessible={false}
          className="absolute -top-4 right-2 aspect-[142/167] w-28 rotate-90"
          testID="memory-created-spin"
        >
          <SpinDecoration
            width="100%"
            height="100%"
          />
        </View>

        <View className="items-center px-8 pt-36">
          <Text
            accessibilityRole="header"
            accessibilityLabel={HEADLINE}
            className="text-center font-poppins-black text-3xl leading-10 text-ink"
          >
            {'Memória\nadicionada!'}
          </Text>
          <Text className="mt-3 max-w-xs text-center font-poppins text-sm text-wine">
            {DESCRIPTION}
          </Text>
        </View>

        <View
          accessible={false}
          className="mt-10 aspect-[390/280] w-full"
          testID="memory-created-hands"
        >
          <HandsDecoration
            width="100%"
            height="100%"
          />
        </View>

        <View className="mt-auto px-12 pb-10 pt-8">
          <Button
            title="Voltar"
            variant="tertiary"
            onPress={handleBackToMemories}
            testID="memory-created-back"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
