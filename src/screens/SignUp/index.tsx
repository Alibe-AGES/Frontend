import { BackButton } from '@/components/BackButton';
import { ContinueButton } from '@/components/ContinueButton';
import { EmailInput } from '@/components/EmailInput';
import { GoogleButton } from '@/components/GoogleButton';
import { KeyboardAvoidingScrollView } from '@/components/KeyboardAvoidingScrollView';
import { PasswordInput } from '@/components/PasswordInput';
import { theme } from '@/theme';
import { isValidEmail } from '@/utils/email';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import AuthHandsDecoration from '@/assets/images/auth-hands-decoration.svg';

const MIN_PASSWORD_LENGTH = 8;

export interface SignUpData {
  email: string;
  password: string;
}

export interface SignUpScreenProps {
  onContinue: (data: SignUpData) => void;
  onGoogleSignUp?: () => void;
  emailError?: string;
}

export function SignUpScreen({ onContinue, onGoogleSignUp, emailError }: SignUpScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);

  const trimmedEmail = email.trim();
  const passwordTooShort = password.length > 0 && password.length < MIN_PASSWORD_LENGTH;
  const passwordsMismatch = passwordConfirmation.length > 0 && passwordConfirmation !== password;
  const canContinue =
    isValidEmail(trimmedEmail) &&
    password.length >= MIN_PASSWORD_LENGTH &&
    passwordConfirmation.length > 0 &&
    !passwordsMismatch;

  return (
    <KeyboardAvoidingScrollView
      className="flex-1 bg-canvas"
      contentContainerClassName="flex-grow px-6"
      keyboardShouldPersistTaps="handled"
    >
      <View
        accessible={false}
        className="-mx-8 aspect-[390/280]"
      >
        <AuthHandsDecoration
          width="100%"
          height="100%"
        />
      </View>

      <BackButton
        fallbackHref="/auth"
        className="absolute top-20"
      />

      <Text
        className={`text-center text-5xl leading-tight tracking-[0.4rem] text-ink ${theme.typography.display}`}
      >
        Criar conta
      </Text>

      <View className="mt-10 flex-grow rounded-t-3xl bg-pink/70 px-6 pb-12 pt-8">
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
            error={
              passwordTooShort
                ? `A senha deve ter pelo menos ${String(MIN_PASSWORD_LENGTH)} caracteres.`
                : undefined
            }
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

        <View className="mt-12 items-center gap-6 pb-12">
          <View className="w-full flex-row items-center gap-4">
            <View className="h-0.5 flex-1 bg-wine" />
            <Text className="text-center font-poppins-light text-lg text-wine">
              Ou continue com
            </Text>
            <View className="h-0.5 flex-1 bg-wine" />
          </View>

          <GoogleButton
            onPress={onGoogleSignUp}
            testID="sign-up-google"
          />
        </View>

        <View className="mt-auto">
          <ContinueButton
            onPress={() => {
              onContinue({ email: trimmedEmail, password });
            }}
            disabled={!canContinue}
            testID="sign-up-continue"
          />
        </View>
      </View>
    </KeyboardAvoidingScrollView>
  );
}
