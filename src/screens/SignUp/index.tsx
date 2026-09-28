import { BackButton } from '@/components/BackButton';
import { ContinueButton } from '@/components/ContinueButton';
import { EmailInput } from '@/components/EmailInput';
import { PasswordInput } from '@/components/PasswordInput';
import { theme } from '@/theme';
import { isValidEmail } from '@/utils/email';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';

import GreenSpin from '@/assets/images/green-spin.svg';
import PinkSpin from '@/assets/images/pink-spin.svg';

export interface SignUpData {
  email: string;
  password: string;
}

export interface SignUpScreenProps {
  onContinue: (data: SignUpData) => void;
  emailError?: string;
}

export function SignUpScreen({ onContinue, emailError }: SignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const trimmedEmail = email.trim();
  const passwordsMismatch = passwordConfirmation.length > 0 && passwordConfirmation !== password;
  const canContinue =
    isValidEmail(trimmedEmail) &&
    password.length > 0 &&
    passwordConfirmation.length > 0 &&
    !passwordsMismatch;

  return (
    <ScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="flex-grow px-6 pt-16"
      keyboardShouldPersistTaps="handled"
    >
      <View
        accessible={false}
        style={tw`absolute -left-6 top-20 h-36 w-36`}
      >
        <GreenSpin
          width="100%"
          height="100%"
        />
      </View>

      <View
        accessible={false}
        style={tw`absolute -right-4 top-12 h-36 w-32`}
      >
        <PinkSpin
          width="100%"
          height="100%"
        />
      </View>

      <BackButton
        fallbackHref="/auth"
        className="mt-6 self-start"
      />

      <Text
        className={`mt-36 text-center text-4xl leading-tight text-ink ${theme.typography.display}`}
      >
        Criar conta
      </Text>

      <View className="mt-8 flex-1 rounded-t-3xl bg-pink/70 px-6 pb-10 pt-8">
        <View className="gap-3">
          <EmailInput
            value={email}
            onChangeText={setEmail}
            error={emailError}
            iconBackground="ink"
            testID="sign-up-email"
          />

          <PasswordInput
            value={password}
            onChangeText={setPassword}
            visible={showPasswords}
            iconBackground="ink"
            testID="sign-up-password"
          />

          <PasswordInput
            variant="confirm"
            value={passwordConfirmation}
            onChangeText={setPasswordConfirmation}
            visible={showPasswords}
            error={passwordsMismatch ? 'As senhas não coincidem.' : undefined}
            iconBackground="ink"
            testID="sign-up-password-confirmation"
          />
        </View>

        <Pressable
          accessibilityRole="switch"
          accessibilityState={{ checked: showPasswords }}
          onPress={() => {
            setShowPasswords((current) => !current);
          }}
          hitSlop={8}
          className="mt-3 flex-row items-center gap-2 self-start px-2"
          testID="sign-up-show-passwords"
        >
          <Ionicons
            name={showPasswords ? 'eye-outline' : 'eye-off-outline'}
            size={16}
            color={theme.colors.wine}
          />
          <Text className="font-poppins-medium text-xs text-wine">
            {showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
          </Text>
        </Pressable>

        <View className="mt-auto pt-10">
          <ContinueButton
            onPress={() => {
              onContinue({ email: trimmedEmail, password });
            }}
            disabled={!canContinue}
            testID="sign-up-continue"
          />
        </View>
      </View>
    </ScrollView>
  );
}
