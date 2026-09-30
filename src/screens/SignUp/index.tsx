import { BackButton } from '@/components/BackButton';
import { ContinueButton } from '@/components/ContinueButton';
import { EmailInput } from '@/components/EmailInput';
import { PasswordInput } from '@/components/PasswordInput';
import { theme } from '@/theme';
import { isValidEmail } from '@/utils/email';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import AuthHandsDecoration from '@/assets/images/auth-hands-decoration.svg';

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
      contentContainerClassName="flex-grow px-6"
      keyboardShouldPersistTaps="handled"
    >
      <View
        accessible={false}
        className="-mx-6 aspect-[390/280]"
      >
        <AuthHandsDecoration
          width="100%"
          height="100%"
        />
      </View>

      <BackButton
        fallbackHref="/auth"
        className="absolute left-10 top-24"
      />

      <Text
        className={`mt-4 text-center text-5xl leading-tight text-ink ${theme.typography.display}`}
      >
        Criar conta
      </Text>

      <View className="mt-20 flex-1 rounded-t-3xl bg-pink/70 px-6 pb-28 pt-16">
        <View className="gap-4">
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
          className="mt-3 flex-row items-center gap-2 self-start px-4"
          testID="sign-up-show-passwords"
        >
          <Ionicons
            name={showPasswords ? 'eye-outline' : 'eye-off-outline'}
            size={18}
            color={theme.colors.wine}
          />
          <Text className="font-poppins text-sm text-wine">
            {showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
          </Text>
        </Pressable>

        <View className="mt-auto pt-6">
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
