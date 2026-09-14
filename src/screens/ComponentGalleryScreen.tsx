import { Button } from '@/components/Button';
import { GroupCard } from '@/components/GroupCard';
import { ScrollView, Text, View } from 'react-native';

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
        <Text className="text-xl font-black text-ink">Group card</Text>
        <GroupCard
          id="1"
          name="Hermanas"
          color="bg-lime"
        />
        <GroupCard
          id="2"
          name="Pela cidade"
          color="bg-pink"
        />
        <GroupCard
          id="3"
          name="Galera 2012"
          color="bg-coral"
          photoUri="https://picsum.photos/seed/galera2012/200"
        />
      </View>
    </ScrollView>
  );
}
