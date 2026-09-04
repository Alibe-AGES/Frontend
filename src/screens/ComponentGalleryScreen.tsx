import { ScrollView, Text, View } from 'react-native';

import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/Button';

const noop = () => undefined;

export function ComponentGalleryScreen() {
  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-6 px-6 py-16"
    >
      <View className="gap-2">
        <Text className="text-4xl font-black text-ink">Component gallery</Text>
        <Text className="text-inkSoft text-base font-medium">
          A quick visual check for reusable components.
        </Text>
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">Button</Text>
        <Button title="Primary button" />
        <Button
          title="Secondary button"
          variant="secondary"
        />
        <Button
          title="Disabled button"
          disabled
        />
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">BackButton</Text>
        <View className="flex-row gap-4">
          <BackButton onPress={noop} />
          <BackButton
            accessibilityLabel="Cancelar"
            onPress={noop}
          />
          <BackButton
            onPress={noop}
            disabled
          />
        </View>
      </View>
    </ScrollView>
  );
}
