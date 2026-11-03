import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import HandsDecoration from '@/assets/images/auth-hands-decoration.svg';
import SpinDecoration from '@/assets/images/memory-created-spin.svg';
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
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.surface }]}>
      {/* Outside the safe area so the cropped edges sit flush with the device corner. */}
      <View
        accessible={false}
        className="pointer-events-none absolute right-0 top-0 aspect-[167/142] w-32"
        testID="memory-created-spin"
      >
        <SpinDecoration
          width="100%"
          height="100%"
        />
      </View>

      <SafeAreaView
        edges={['top', 'left', 'right', 'bottom']}
        style={tw`flex-1`}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="grow"
          testID="memory-created-screen"
        >
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
    </View>
  );
}
