import { BackButton } from '@/components/BackButton';
import { ContinueButton } from '@/components/ContinueButton';
import { PhotoPicker } from '@/components/PhotoPicker';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { TextInput } from '@/components/TextInput';
import { createGroup } from '@/server/groups';
import { theme } from '@/theme';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import tw from 'twrnc';

import CreateGroupDecoration from '@/assets/images/create-group-decoration.svg';
import PencilIcon from '@/assets/images/pencil.svg';

export function CreateGroupScreen() {
  const [groupName, setGroupName] = useState('');
  const [groupPhoto, setGroupPhoto] = useState<SelectedPhoto | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleCreateGroup = async () => {
    const name = groupName.trim();

    if (name.length < 2 || name.length > 100) {
      setNameError('O nome deve conter entre 2 e 100 caracteres.');
      return;
    }

    setNameError(null);
    setIsSubmitting(true);

    try {
      const group = await createGroup({ name, image: groupPhoto });
      router.push({
        pathname: '/create-group/invite',
        params: { groupId: group.id },
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Erro',
        text2: 'Não foi possível criar o grupo. Tente novamente.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="flex-grow px-6 pt-16"
      keyboardShouldPersistTaps="handled"
    >
      <View
        accessible={false}
        style={tw`absolute -right-2 top-0 h-40 w-40`}
      >
        <CreateGroupDecoration
          width="100%"
          height="100%"
        />
      </View>

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
        <PhotoPicker
          imageClassName="h-44 w-44"
          onUploadSuccess={(photo) => {
            setGroupPhoto(photo);
          }}
          disabled={isSubmitting}
        />

        <View className="mt-6">
          <TextInput
            value={groupName}
            onChangeText={(name) => {
              setGroupName(name);
              setNameError(null);
            }}
            placeholder="Nome do grupo"
            error={nameError ?? undefined}
            disabled={isSubmitting}
            maxLength={100}
            icon={
              <PencilIcon
                width={20}
                height={20}
              />
            }
          />
        </View>

        <View className="mt-auto pt-6">
          <ContinueButton
            onPress={() => void handleCreateGroup()}
            disabled={isSubmitting}
            isLoading={isSubmitting}
          />
        </View>
      </View>
    </ScrollView>
  );
}
