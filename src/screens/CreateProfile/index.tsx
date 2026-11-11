import { BackButton } from '@/components/BackButton';
import { ContinueButton } from '@/components/ContinueButton';
import { PhotoPicker } from '@/components/PhotoPicker';
import type { SelectedPhoto } from '@/components/PhotoPicker/PhotoPicker.types';
import { ScreenFrame } from '@/components/ScreenFrame';
import { TextInput } from '@/components/TextInput';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Text, View } from 'react-native';

import ProfileDecoration from '@/assets/images/create-group-decoration.svg';

// Aumenta o viewBox original do SVG para ele não ficar cortado nessa tela
const DECORATION_VIEW_BOX = '0 -19 167 166';

export interface CreateProfileData {
  nickname: string;
  photo: SelectedPhoto | null;
}

export interface CreateProfileScreenProps {
  onContinue: (profile: CreateProfileData) => void;
  isSubmitting?: boolean;
}

export function CreateProfileScreen({
  onContinue,
  isSubmitting = false,
}: CreateProfileScreenProps) {
  const [nickname, setNickname] = useState('');
  const [photo, setPhoto] = useState<SelectedPhoto | null>(null);
  const trimmedNickname = nickname.trim();

  return (
    <ScreenFrame
      padding="horizontal"
      topFade="always"
      testID="create-profile-screen"
      floatingChrome
      testID="create-profile-screen"
      header={
        <BackButton
          fallbackHref="/sign-up"
          className="self-start"
        />
      }
    >
      <View
        accessible={false}
        className="absolute left-[-4.45rem] top-[-2.64rem] h-[12.69rem] w-[12.76rem] rotate-[108deg]"
      >
        <ProfileDecoration
          width="100%"
          height="100%"
          viewBox={DECORATION_VIEW_BOX}
        />
      </View>

      <View
        accessible={false}
        className="absolute right-[-6.0rem] top-[13.6rem] h-[11.89rem] w-[11.96rem] -rotate-90"
      >
        <ProfileDecoration
          width="100%"
          height="100%"
          viewBox={DECORATION_VIEW_BOX}
        />
      </View>

      <Text
        adjustsFontSizeToFit
        numberOfLines={2}
        className={`mt-[9.4rem] text-center text-[2.857rem] leading-[3rem] text-ink ${theme.typography.display}`}
      >
        Vamos criar{'\n'}seu perfil?
      </Text>

      <Text className="mt-[0.8rem] text-center font-poppins-medium text-[0.857rem] leading-[1.07rem] text-wine">
        Você poderá adicionar ou trocar sua foto e nome{'\n'}de usuário a qualquer momento pelo seu
        perfil.
      </Text>

      <View
        className="mt-[5.25rem] flex-1 rounded-t-[2.36rem] px-6 pb-16 pt-8"
        style={{ backgroundColor: theme.colors.pink }}
      >
        <PhotoPicker
          placeholder="camera"
          labelClassName="text-wine"
          onUploadSuccess={setPhoto}
          disabled={isSubmitting}
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
            disabled={isSubmitting}
            testID="create-profile-nickname"
          />
        </View>

        <View className="mt-12">
          <ContinueButton
            onPress={() => {
              onContinue({ nickname: trimmedNickname, photo });
            }}
            disabled={trimmedNickname.length === 0 || isSubmitting}
            isLoading={isSubmitting}
            testID="create-profile-continue"
          />
        </View>
      </View>
    </ScreenFrame>
  );
}
