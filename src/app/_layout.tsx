import '@/global.css';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  useFonts,
} from '@expo-google-fonts/poppins';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { polyfillWebCrypto } from 'expo-standard-web-crypto';
import { useEffect } from 'react';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

polyfillWebCrypto();

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <KeyboardProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(profile)" />
          <Stack.Screen name="(app)" />
        </Stack>
        <Toast />
      </KeyboardProvider>
    </>
  );
}
