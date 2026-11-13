import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import tw from 'twrnc';

import SpinDecoration from '@/assets/images/memory-created-spin.svg';
import { Button } from '@/components/Button';
import { theme } from '@/theme';
import { HandsHiFive } from '@/components/HandsHiFive';

const HEADLINE = 'Memória adicionada!';
const DESCRIPTION = 'Volte a galeria de memórias\npara conferir!';

export function MemoryCreatedScreen() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  function handleBackToMemories() {
    router.dismissTo({ pathname: '/group/[id]/memories', params: { id: groupId } });
  }

  return (
    <View style={[tw`flex-1`, { backgroundColor: theme.colors.canvas }]}>
      {/* Outside the safe area so the cropped edges sit flush with the device corner. */}
      <View
        accessible={false}
        className="pointer-events-none absolute right-0 top-0 aspect-[167/142] w-44"
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
          <View className="mt-44 items-center px-8">
            <Text
              accessibilityRole="header"
              accessibilityLabel={HEADLINE}
              adjustsFontSizeToFit
              numberOfLines={2}
              className={`text-center text-[2.857rem] leading-[3rem] text-ink ${theme.typography.display}`}
            >
              {'Memória\nadicionada!'}
            </Text>
            <Text className="mt-5 text-center font-poppins text-xl leading-7 text-wine">
              {DESCRIPTION}
            </Text>
          </View>

          <View
            accessible={false}
            className="aspect-[390/280]"
          >
            <HandsHiFive variant="sign-up" />
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
