import { Button } from '@/components/Button';
import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

export function ComponentGalleryScreen() {
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="gap-6 px-6 py-16"
    >
      <View className="items-center justify-center">
        <Button title="Simple button" />
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">Galeria de Memórias (ALI-123)</Text>
        <Text className="text-sm text-ink-soft">
          Atalhos para testar a tela de galeria no emulador/celular:
        </Text>
        <Button
          title="Abrir Galeria (Setembro 2026)"
          onPress={() => {
            router.push({
              pathname: '/group/[id]/memories/gallery',
              params: {
                id: '7cd60fad-d815-41b3-b3bc-567aa63eb666',
                month: '9',
                year: '2026',
              },
            });
          }}
        />
        <Button
          title="Abrir Galeria no dia 05/09/2026"
          variant="secondary"
          onPress={() => {
            router.push({
              pathname: '/group/[id]/memories/gallery',
              params: {
                id: '7cd60fad-d815-41b3-b3bc-567aa63eb666',
                date: '2026-09-05',
              },
            });
          }}
        />
      </View>
    </ScrollView>
  );
}
