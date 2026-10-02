import { Button } from '@/components/Button';
import { theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, View } from 'react-native';

interface AuthenticationRequiredScreenProps {
  onLogin: () => void;
}

export function AuthenticationRequiredScreen({ onLogin }: AuthenticationRequiredScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-canvas">
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-coral-soft">
          <Ionicons
            name="lock-closed-outline"
            size={36}
            color={theme.colors.ink}
          />
        </View>
        <Text
          accessibilityRole="header"
          className="text-center font-poppins-black text-3xl text-ink"
        >
          Acesso restrito
        </Text>
        <Text className="mt-3 max-w-sm text-center font-poppins leading-6 text-ink-soft">
          Entre na sua conta para acessar esta página.
        </Text>
        <View className="mt-8 w-full max-w-xs">
          <Button
            title="Ir para login"
            onPress={onLogin}
            testID="authentication-required-login"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
