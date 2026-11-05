import '@/global.css';
import {
  Poppins_300Light,
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
import { KeyboardProvider } from 'react-native-keyboard-controller';
import Toast from 'react-native-toast-message';

import { AuthenticatedRoute } from '@/components/AuthenticatedRoute';
import { PendingInviteProvider } from '@/hooks/usePendingInvite';
import { SignUpDraftProvider } from '@/hooks/useSignUpDraft';
import { PushNotifications } from '@/notifications/PushNotifications';
import { AnimatedSplash } from '@/screens/AnimatedSplash';
import { theme } from '@/theme';
import { StatusBar } from 'react-native';

polyfillWebCrypto();

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const pathname = usePathname();
  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });

  // Everything the app waits for before leaving the splash.
  const isAppReady = fontsLoaded;

  useEffect(() => {
    // The animated splash takes over from the native one, which only shows the background.
    void SplashScreen.hideAsync();
  }, []);

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(profile)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
  const publicPaths = ['/', '/auth', '/login', '/sign-up', '/profile', '/component-gallery'];
  const isPublicRoute = publicPaths.includes(pathname);

  return (
    // Required by ScreenFrame: keyboard-aware scrolling does nothing without this provider.
    <KeyboardProvider>
      <SignUpDraftProvider>
        <PendingInviteProvider>
          {isAppReady ? (
            <AuthenticatedRoute enabled={!isPublicRoute}>{stack}</AuthenticatedRoute>
          ) : null}
          {isSplashVisible ? (
            <AnimatedSplash
              isReady={isAppReady}
              onFinish={() => {
                setIsSplashVisible(false);
              }}
            />
          ) : null}
          <PushNotifications />
          <StatusBar
            barStyle="dark-content"
            backgroundColor={theme.colors.canvas}
          />
          <Toast />
        </PendingInviteProvider>
      </SignUpDraftProvider>
    </KeyboardProvider>
  );
}
