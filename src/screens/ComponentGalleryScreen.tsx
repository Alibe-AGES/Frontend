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
        <Text className="text-4xl font-black text-ink">Component gallery</Text>
        <Text className="text-inkSoft text-base font-medium">
          A quick visual check for reusable components.
        </Text>
      </View>

      <View className="gap-4 rounded-3xl bg-surface p-5">
        <Text className="text-xl font-black text-ink">Tela: Galeria de Memórias</Text>
        <Text className="text-sm text-inkSoft">
          Atalhos temporários para visualizar a tela de galeria (ALI-123).
        </Text>
        <Button
          title="Abrir Galeria (Setembro 2026 - com fotos mockadas)"
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
          title="Abrir Galeria com dia selecionado (05/09/2026)"
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
    </ScrollView>
  );
}
