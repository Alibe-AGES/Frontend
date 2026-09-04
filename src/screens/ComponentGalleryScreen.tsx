import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/Button';
import { CreateGroupButton } from '@/components/CreateGroupButton';

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
        <Text className="text-xl font-black text-ink">Create group button</Text>
        <View className="flex-row items-start gap-6">
          <View className="items-center gap-2">
            <CreateGroupButton />
            <Text className="text-inkSoft text-sm font-medium">Default</Text>
          </View>
          <View className="items-center gap-2">
            <CreateGroupButton disabled />
            <Text className="text-inkSoft text-sm font-medium">Disabled</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
