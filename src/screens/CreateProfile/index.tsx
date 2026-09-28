import { ContinueButton } from '@/components/ContinueButton';
import { PhotoPicker } from '@/components/PhotoPicker';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { TextInput } from '@/components/TextInput';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import ProfileDecoration from '@/assets/images/create-group-decoration.svg';

// Aumenta o viewBox original do SVG para ele não ficar cortado nessa tela
const DECORATION_VIEW_BOX = '0 -19 167 166';

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
        className="absolute -left-12 -top-10 h-48 w-48 rotate-[100deg]"
      >
        <ProfileDecoration
          width="100%"
          height="100%"
          viewBox={DECORATION_VIEW_BOX}
        />
      </View>

      <View
        accessible={false}
        className="absolute -right-16 top-52 h-44 w-44 -rotate-90"
      >
        <ProfileDecoration
          width="100%"
          height="100%"
          viewBox={DECORATION_VIEW_BOX}
        />
      </View>

      <Text
        className={`mt-16 text-center text-5xl leading-tight text-ink ${theme.typography.display}`}
      >
        Vamos criar{'\n'}seu perfil?
      </Text>

      <Text className="mt-3 px-4 text-center font-poppins-medium text-sm text-wine">
        Você poderá adicionar ou trocar sua foto e nome de usuário a qualquer momento pelo seu
        perfil.
      </Text>

      <View className="mt-20 flex-1 rounded-t-3xl bg-pink/70 px-6 pb-10 pt-10">
        <PhotoPicker
          placeholder="camera"
          imageClassName="h-44 w-44"
          onUploadSuccess={setPhoto}
          testID="create-profile-photo"
        />

        <Text className="mt-8 text-center font-poppins-medium text-xl text-wine">
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
