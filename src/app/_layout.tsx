import '@/global.css';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  useFonts,
} from '@expo-google-fonts/poppins';
import { usePathname } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { polyfillWebCrypto } from 'expo-standard-web-crypto';
import { useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';

import { AnimatedSplash } from '@/components/AnimatedSplash';
import { AuthenticatedRoute } from '@/components/AuthenticatedRoute';
import { SignUpDraftProvider } from '@/hooks/useSignUpDraft';

polyfillWebCrypto();

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const [isSplashVisible, setIsSplashVisible] = useState(true);
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

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(profile)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
  const publicPaths = ['/', '/auth', '/login', '/sign-up'];
  const isPublicRoute = publicPaths.includes(pathname);

  return (
    <SignUpDraftProvider>
      <AuthenticatedRoute enabled={!isPublicRoute}>{stack}</AuthenticatedRoute>
      {isSplashVisible ? (
        <AnimatedSplash
          onFinish={() => {
            setIsSplashVisible(false);
          }}
        />
      ) : null}
      <Toast />
    </SignUpDraftProvider>
  );
}
