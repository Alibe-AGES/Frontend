import { preloadGroups } from '@/hooks/useGroups';
import { LoadingScreen } from '@/screens/Loading';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function LoadingController() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function prepareNextScreen() {
      await preloadGroups();

      if (!cancelled) {
        router.replace('/groups');
      }
    }

    void prepareNextScreen();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return <LoadingScreen />;
}
