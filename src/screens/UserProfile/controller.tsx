import { useAuth } from '@/server/mock/useAuth';
import { getUserProfile as getMockUserProfile } from '@/server/mock/userProfile';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { UserProfileScreen } from '.';
import { getMyProfile } from '../../server/users';

export interface ProfileData {
  name: string;
  photoUri: string | null;
  created_at: string;
  completedEventsCount: number;
  pendingEventsCount: number;
}

export default function UserProfileController() {
  const { userId, groupId } = useLocalSearchParams<{ userId: string; groupId: string }>();
  const { userId: currentUserId } = useAuth();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const isOwnProfile = !!userId && userId === currentUserId;

  const fetchProfile = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      if (isOwnProfile) {
        const apiData = await getMyProfile();

        setProfile({
          name: apiData.name,
          photoUri: apiData.image,
          created_at: new Date(apiData.createdAt).toLocaleDateString('pt-BR', {
            month: 'long',
            year: 'numeric',
          }),
          completedEventsCount: apiData.completedEvents,
          pendingEventsCount: apiData.eventsInDecision,
        });
      } else {
        const mockData = await getMockUserProfile(userId);
        setProfile(mockData);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar perfil'));

      // Feedback visual para o utilizador
      Toast.show({
        type: 'error',
        text1: 'Erro!',
        text2: 'Não foi possível carregar as informações do perfil.',
      });
    } finally {
      setIsLoading(false);
    }
  }, [userId, isOwnProfile]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  return (
    <UserProfileScreen
      userId={userId}
      groupId={groupId}
      isOwnProfile={isOwnProfile}
      profile={profile}
      isLoading={isLoading}
      error={error}
      refetch={() => {
        void fetchProfile();
      }}
    />
  );
}
