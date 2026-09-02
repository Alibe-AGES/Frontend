import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';

export function ComponentGalleryScreen() {
  return (
    <ScrollView
      className="bg-canvas flex-1"
      contentContainerClassName="gap-6 px-6 py-16"
    >
      <View className="gap-2">
        <Text className="text-ink text-4xl font-black">Component gallery</Text>
        <Text className="text-inkSoft text-base font-medium">
          A quick visual check for reusable components.
        </Text>
      </View>

      <View className="bg-surface gap-4 rounded-3xl p-5">
        <Text className="text-ink text-xl font-black">Button</Text>
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
    </ScrollView>
  );
}
