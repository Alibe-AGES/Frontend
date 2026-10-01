import { getMe } from '@/server/groups';
import { useRouter } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AuthenticationRequiredScreen } from '@/screens/AuthenticationRequired';

type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthenticatedRouteProps {
  children: ReactNode;
}

export function AuthenticatedRoute({ children }: AuthenticatedRouteProps) {
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<AuthStatus>('checking');

  useEffect(() => {
    let isActive = true;

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
  }, []);

  if (authStatus === 'checking') {
    return (
      <View className="flex-1 items-center justify-center bg-canvas">
        <ActivityIndicator
          accessibilityLabel="Validando sessão"
          color="#036147"
          testID="auth-check-loading"
        />
      </View>
    );
  }

  if (authStatus === 'unauthenticated') {
    return (
      <AuthenticationRequiredScreen
        onLogin={() => {
          router.replace('/login');
        }}
      />
    );
  }

  return children;
}
