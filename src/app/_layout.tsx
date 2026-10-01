import '@/global.css';
import { theme } from '@/theme';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_900Black,
  useFonts,
} from '@expo-google-fonts/poppins';
import { useRouter, useSegments } from 'expo-router';
import { Stack } from 'expo-router/stack';
import * as SplashScreen from 'expo-splash-screen';
import { polyfillWebCrypto } from 'expo-standard-web-crypto';
import { useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import Toast from 'react-native-toast-message';

import { preloadGroups } from '@/hooks/useGroups';
import { authClient } from '@/server/auth-client';
import { getAuthRedirect } from '@/utils/auth-routing';

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

  return <RootNavigation />;
}

function RootNavigation() {
  const router = useRouter();
  const segments = useSegments();
  const hasHandledInitialSession = useRef(false);
  const isPreloadingGroups = useRef(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    const currentSegment = segments[0] as string | undefined;
    const isInitialCheck = !hasHandledInitialSession.current;
    const destination = getAuthRedirect(
      currentSegment,
      Boolean(session),
      isPending,
      isInitialCheck
    );

    if (isPending || isPreloadingGroups.current) {
      return;
    }

    hasHandledInitialSession.current = true;

    if (isInitialCheck && destination === '/groups') {
      isPreloadingGroups.current = true;
      void preloadGroups().then(() => {
        isPreloadingGroups.current = false;
        router.replace('/groups');
      });
      return;
    }

    if (destination) {
      router.replace(destination);
    }
  }, [isPending, router, segments, session]);

  return (
    <>
      <StatusBar
        barStyle={'dark-content'}
        backgroundColor={theme.colors.canvas}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(profile)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <Toast />
    </>
  );
}
