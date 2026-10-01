import { BackButton } from '@/components/BackButton';
import { ContinueButton } from '@/components/ContinueButton';
import { EmailInput } from '@/components/EmailInput';
import { PasswordInput } from '@/components/PasswordInput';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import tw from 'twrnc';

import LoginHandsDecoration from '@/assets/images/login-hands-decoration.svg';

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginScreenProps {
  onContinue: (credentials: LoginData) => void | Promise<void>;
  onForgotPassword?: () => void;
  errorMessage?: string;
  isLoading?: boolean;
}

export function LoginScreen({
  onContinue,
  onForgotPassword,
  errorMessage,
  isLoading = false,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const trimmedEmail = email.trim();
  const canContinue = trimmedEmail.length > 0 && password.length > 0;

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
        <LoginHandsDecoration
          width="100%"
          height="100%"
        />
      </View>

      <BackButton
        className="absolute left-10 top-24"
        fallbackHref="/auth"
      />

      <Text className="mt-4 text-center font-poppins-black text-5xl leading-tight tracking-[0.3rem] text-ink">
        Login
      </Text>

      <View className="mt-20 flex-1 rounded-t-3xl bg-lime-soft px-6 pb-28 pt-16">
        <View className="gap-4">
          <EmailInput
            value={email}
            onChangeText={setEmail}
            testID="login-email"
          />
          <PasswordInput
            value={password}
            onChangeText={setPassword}
            visible={isPasswordVisible}
            testID="login-password"
          />
        </View>

        <View className="mt-3 flex-row items-center justify-between px-4">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            className="flex-row items-center gap-2"
            hitSlop={8}
            style={({ pressed }) => tw`${pressed ? 'opacity-60' : 'opacity-100'}`}
            onPress={() => {
              setIsPasswordVisible((current) => !current);
            }}
            testID="login-toggle-password"
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={theme.colors.wine}
            />
            <Text className="font-poppins text-sm text-wine">
              {isPasswordVisible ? 'Ocultar' : 'Mostrar'}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="link"
            hitSlop={8}
            style={({ pressed }) => tw`${pressed ? 'opacity-60' : 'opacity-100'}`}
            onPress={onForgotPassword}
            testID="login-forgot-password"
          >
            <Text className="font-poppins-semibold text-sm text-wine underline">
              Esqueci minha senha
            </Text>
          </Pressable>
        </View>

        <View className="mt-auto pt-6">
          {errorMessage ? (
            <Text
              accessibilityRole="alert"
              className="mb-3 text-center font-poppins text-sm text-wine"
            >
              {errorMessage}
            </Text>
          ) : null}
          <ContinueButton
            onPress={() => {
              void onContinue({ email: trimmedEmail, password });
            }}
            disabled={!canContinue || isLoading}
            isLoading={isLoading}
            testID="login-continue"
          />
        </View>
      </View>
    </ScrollView>
  );
}
