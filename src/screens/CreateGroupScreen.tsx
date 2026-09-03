import { Button } from '@/components/Button';
import { BackButton } from '@/components/BackButton';

import { Image, Pressable, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';

import createGroupDecoration from '@/assets/images/create-group-decoration.png';
import groupPlaceholder from '@/assets/images/group-placeholder.png';

export function CreateGroupScreen() {
  return (
    <View className="py-22 flex-1 bg-surface px-6">
      <Image
        source={createGroupDecoration}
        className="absolute right-0 top-0"
        style={{ width: 120, height: 120 }}
        resizeMode="contain"
      />

      <BackButton
        onPress={() => {
          router.replace('/groups');
        }}
      />

      <Text
        className="mt-12 text-center text-4xl font-black text-ink"
        style={{ lineHeight: 25 }}
      >
        Vamos
        {'\n'}
        começar?
      </Text>

      <Text className="mt-2 text-center text-xs font-bold text-terracota">
        Seu próximo encontro nasce aqui.
      </Text>

      <View className="mt-8 flex-1 rounded-t-3xl bg-lime-soft p-6">
        <Text className="text-center text-sm font-bold text-black">
          Adicionar foto (opcional)
        </Text>

        <Pressable
  onPress={() => {
    // Handle press event
  }}
  className="mt-4 h-44 w-44 items-center justify-center self-center rounded-full bg-white"
>
  <Image
    source={groupPlaceholder}
    className="h-full w-full"
    resizeMode="contain"
  />
</Pressable>

        <View className="mt-6 flex-row items-center rounded-xl bg-white px-4">
          <TextInput
            placeholder="Nome do grupo"
            className="flex-1 py-2 text-base text-coral-soft placeholder:text-coral-soft"
          />

          <Text className="text-xl text-coral-soft">✎</Text>
        </View>

        <View className="mt-8">
          <Button title="Continuar" />
        </View>
      </View>
    </View>
  );
}