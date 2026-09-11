import { Button } from '@/components/Button';
import { BackButton } from '@/components/BackButton';
import { PhotoPicker } from '@/components/PhotoPicker';
import { TextInput } from '@/components/TextInput';

import { useState } from 'react';
import { Image, Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import createGroupDecoration from '@/assets/images/create-group-decoration.png';

export function CreateGroupScreen() {
  const [groupName, setGroupName] = useState('');
  const router = useRouter();

  return (
    <View className="py-22 flex-1 bg-surface px-6">
      <Image
        source={createGroupDecoration}
        className="absolute right-0 top-0"
        style={{ width: 120, height: 120 }}
        resizeMode="contain"
      />

      <BackButton
        fallbackHref="/groups"
        className="mt-6 self-start"
      />

      <Text
        className="mt-12 text-center text-4xl font-black text-ink"
        style={{ lineHeight: 25 }}
      >
        Vamos
        {'\n'}
        começar?
      </Text>

      <Text className="text-terracota mt-2 text-center text-xs font-bold">
        Seu próximo encontro nasce aqui.
      </Text>

      <View className="mt-8 flex-1 rounded-t-3xl bg-lime-soft p-6">
        <PhotoPicker imageClassName="h-44 w-44" />

        <View className="mt-6">
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Nome do grupo"
            icon={<Text className="text-xl text-coral-soft">✎</Text>}
          />
        </View>

        <View className="mt-8">
          <Button
            title="Continuar"
            onPress={() => {
              router.push('/create-group/invite');
            }}
          />
        </View>
      </View>
    </View>
  );
}
