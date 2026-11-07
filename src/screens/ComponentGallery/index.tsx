import { Button } from '@/components/Button';
import { MemoryCard } from '@/components/MemoryCard';
import { View } from 'react-native';

export function ComponentGalleryScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-canvas px-6">
      <Button title="Simple button" />

      <MemoryCard
        date={new Date()}
        name="Sample Memory"
        address="123 Main St, City, State 12345"
        imageUri="https://picsum.photos/600/800"
      />
    </View>
  );
}
