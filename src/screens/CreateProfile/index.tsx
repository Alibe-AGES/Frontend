import { ContinueButton } from '@/components/ContinueButton';
import { PhotoPicker } from '@/components/PhotoPicker';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { TextInput } from '@/components/TextInput';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';

import ProfileDecoration from '@/assets/images/create-group-decoration.svg';

export interface CreateProfileData {
  nickname: string;
  photo: SelectedPhoto | null;
}

export interface CreateProfileScreenProps {
  onContinue: (profile: CreateProfileData) => void;
}

export function CreateProfileScreen({ onContinue }: CreateProfileScreenProps) {
  const [nickname, setNickname] = useState('');
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const trimmedNickname = nickname.trim();

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="flex-grow px-6 pt-16"
      keyboardShouldPersistTaps="handled"
    >
      <View
        accessible={false}
        style={[tw`absolute -left-4 -top-4 h-32 w-32`, { transform: [{ scaleX: -1 }] }]}
      >
        <ProfileDecoration
          width="100%"
          height="100%"
        />
      </View>

      <View
        accessible={false}
        style={tw`absolute -right-2 top-56 h-28 w-28`}
      >
        <ProfileDecoration
          width="100%"
          height="100%"
        />
      </View>

      <Text
        className={`mt-16 text-center text-4xl leading-tight text-ink ${theme.typography.display}`}
      >
        Vamos criar{'\n'}seu perfil?
      </Text>

      <Text className="mt-3 px-4 text-center font-poppins-medium text-xs text-wine">
        Você poderá adicionar ou trocar sua foto e nome de usuário a qualquer momento pelo seu
        perfil.
      </Text>

      <View className="mt-12 flex-1 rounded-t-3xl bg-pink/70 px-6 pb-10 pt-10">
        <PhotoPicker
          placeholder="camera"
          imageClassName="h-44 w-44"
          onUploadSuccess={setPhoto}
          testID="create-profile-photo"
        />

        <Text className="mt-8 text-center font-poppins-medium text-base text-wine">
          Como seus amigos te chamam?
        </Text>

        <View className="mt-3">
          <TextInput
            value={nickname}
            onChangeText={setNickname}
            placeholder="Nome de usuário"
            icon={
              <Ionicons
                name="person-outline"
                size={22}
                color={theme.colors.white}
              />
            }
            iconBackground="ink"
            testID="create-profile-nickname"
          />
        </View>

        <View className="mt-auto pt-8">
          <ContinueButton
            onPress={() => {
              onContinue({ nickname: trimmedNickname, photo });
            }}
            disabled={trimmedNickname.length === 0}
            testID="create-profile-continue"
          />
        </View>
      </View>
    </ScrollView>
  );
}
