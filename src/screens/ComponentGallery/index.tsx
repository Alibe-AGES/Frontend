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
      <View className="gap-2">
        <Text className="text-3xl font-black text-ink">Component gallery</Text>
        <Text className="text-base font-medium text-ink-soft">
          Atalhos de teste para desenvolvimento
        </Text>
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">Galeria de Memórias (ALI-123)</Text>
        <Text className="text-sm text-ink-soft">
          Clique abaixo para abrir a tela da Galeria com dados reais do banco:
        </Text>
        <Button
          title="Abrir Galeria (Setembro 2026)"
          onPress={() => {
            router.push({
              pathname: '/group/[id]/memories/gallery' as never,
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
              pathname: '/group/[id]/memories/gallery' as never,
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
