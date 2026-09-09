import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { PhotoPicker } from '@/components/PhotoPicker';
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
        <Text className="text-xl font-black text-ink">PhotoPicker</Text>
        <View className="flex-row gap-4 rounded-3xl bg-surface p-5">
          <View className="gap-4 rounded-3xl bg-pink p-5">
            <PhotoPicker />
          </View>
          <View className="gap-4 rounded-3xl bg-lime p-5">
            <PhotoPicker />
          </View>
          <View className="rounded-3xl bg-coral p-5">
            <PhotoPicker />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
