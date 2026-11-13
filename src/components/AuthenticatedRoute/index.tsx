import { getMe } from '@/server/groups';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthenticationRequiredScreen } from '@/screens/AuthenticationRequired';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthenticatedRouteProps {
  children: ReactNode;
  enabled?: boolean;
}

export function AuthenticatedRoute({ children, enabled = true }: AuthenticatedRouteProps) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let isActive = true;
    setAuthStatus('checking');

    void getMe()
      .then(() => {
        if (isActive) {
          setAuthStatus('authenticated');
        }
      })
      .catch(() => {
        if (isActive) {
          setAuthStatus('unauthenticated');
        }
      });

    return () => {
      isActive = false;
    };
  }, [enabled]);

  const isChecking = enabled && authStatus === 'checking';
  const isUnauthenticated = enabled && authStatus === 'unauthenticated';
  const isContentHidden = isChecking || isUnauthenticated;

  return (
    <View className="flex-1">
      <View
        className="flex-1"
        pointerEvents={isContentHidden ? 'none' : 'auto'}
        accessibilityElementsHidden={isContentHidden}
        importantForAccessibility={isContentHidden ? 'no-hide-descendants' : 'auto'}
      >
        {children}
      </View>
      {isChecking ? (
        <View className="absolute inset-0 items-center justify-center bg-canvas">
          <ActivityIndicator
            accessibilityLabel="Validando sessão"
            color="#036147"
            testID="auth-check-loading"
          />
        </View>
      ) : null}
      {isUnauthenticated ? (
        <View className="absolute inset-0">
          <AuthenticationRequiredScreen
            onLogin={() => {
              router.replace('/login');
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
