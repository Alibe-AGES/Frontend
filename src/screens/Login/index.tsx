import { BackButton } from '@/components/BackButton';
import { ContinueButton } from '@/components/ContinueButton';
import { EmailInput } from '@/components/EmailInput';
import { GoogleButton } from '@/components/GoogleButton';
import { HandsHiFive } from '@/components/HandsHiFive';
import { PasswordInput } from '@/components/PasswordInput';
import { ScreenFrame } from '@/components/ScreenFrame';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import tw from 'twrnc';

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginScreenProps {
  onContinue: (credentials: LoginData) => void | Promise<void>;
  onForgotPassword?: () => void;
  onGoogleSignIn?: () => void;
  errorMessage?: string;
  isLoading?: boolean;
  isGoogleLoading?: boolean;
}

export function LoginScreen({
  onContinue,
  onForgotPassword,
  onGoogleSignIn,
  errorMessage,
  isLoading = false,
  isGoogleLoading = false,
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const trimmedEmail = email.trim();
  const canContinue = trimmedEmail.length > 0 && password.length > 0;

  return (
    <ScreenFrame
      padding="horizontal"
      topFade
      floatingChrome
      testID="login-screen"
      header={
        <BackButton
          className="self-start"
          fallbackHref="/auth"
        />
      }
    >
      <View
        accessible={false}
        className="-mx-8 aspect-[390/280]"
      >
        <HandsHiFive variant="login" />
      </View>

      <Text
        className={`text-center text-[2.857rem] leading-tight text-ink ${theme.typography.display}`}
      >
        Login
      </Text>

      <View className="mt-10 flex-grow rounded-t-3xl bg-lime-soft px-6 pb-12 pt-8">
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

        <View className="mt-12 items-center gap-6 pb-12">
          <View className="w-full flex-row items-center gap-4">
            <View className="h-0.5 flex-1 bg-wine" />
            <Text className="text-center font-poppins-light text-lg text-wine">
              Ou continue com
            </Text>
            <View className="h-0.5 flex-1 bg-wine" />
          </View>

          <GoogleButton
            onPress={onGoogleSignIn}
            disabled={isLoading}
            isLoading={isGoogleLoading}
            testID="login-google"
          />
        </View>

        <View className="mt-auto">
          {errorMessage ? (
            <Text
              accessibilityRole="alert"
              className="mb-3 text-center font-poppins text-sm text-error"
            >
              {errorMessage}
            </Text>
          ) : null}
          <ContinueButton
            onPress={() => {
              void onContinue({ email: trimmedEmail, password });
            }}
            disabled={!canContinue || isLoading || isGoogleLoading}
            isLoading={isLoading}
            testID="login-continue"
          />
        </View>
      </View>
    </ScreenFrame>
  );
}
