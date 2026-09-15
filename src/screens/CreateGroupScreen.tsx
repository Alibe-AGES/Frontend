import { BackButton } from '@/components/BackButton';
import { ContinueButton } from '@/components/ContinueButton';
import { PhotoPicker } from '@/components/PhotoPicker';
import { TextInput } from '@/components/TextInput';
import { theme } from '@/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';

import createGroupDecoration from '@/assets/images/create-group-decoration.svg';
import pencilIcon from '@/assets/images/pencil.svg';

export function CreateGroupScreen() {
  const [groupName, setGroupName] = useState('');
  const router = useRouter();

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="flex-grow px-6 pt-16"
      keyboardShouldPersistTaps="handled"
    >
      {/* expo-image ignora className no nativo; twrnc aplica o mesmo utilitário via style. */}
      <Image
        source={createGroupDecoration}
        accessible={false}
        contentFit="contain"
        style={tw`absolute -right-2 top-0 h-40 w-40`}
      />

      <BackButton
        fallbackHref="/groups"
        className="mt-6 self-start"
      />

      <Text
        className={`mt-12 text-center text-5xl leading-tight text-ink ${theme.typography.display}`}
      >
        Vamos{'\n'}começar?
      </Text>

      <Text className="mt-2 text-center font-poppins-medium text-sm text-black">
        Seu próximo encontro nasce aqui.
      </Text>

      <View className="mt-20 flex-1 rounded-t-3xl bg-lime-soft px-6 pb-28 pt-16">
        <PhotoPicker imageClassName="h-44 w-44" />

        <View className="mt-6">
          <TextInput
            value={groupName}
            onChangeText={setGroupName}
            placeholder="Nome do grupo"
            icon={
              <Image
                source={pencilIcon}
                accessible={false}
                contentFit="contain"
                style={tw`h-5 w-5`}
              />
            }
          />
        </View>

        <View className="mt-auto pt-6">
          <ContinueButton
            onPress={() => {
              router.push('/create-group/invite');
            }}
          />
        </View>
      </View>
    </ScrollView>
  );
}
