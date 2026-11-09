import { signOut } from '@/server/auth';
import { useAuth } from '@/server/mock/useAuth';
import { getUserProfile as getMockUserProfile } from '@/server/mock/userProfile';
import { resolveApiImageUrl } from '@/utils/apiImageUrl';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import Toast from 'react-native-toast-message';
import { UserProfileScreen, type UserProfileUpdate } from '.';
import { getMyProfile, updateMyProfile, updateUserProfilePicture } from '../../server/users';

export interface ProfileData {
  name: string;
  photoUri: string | null;
  created_at: string;
  completedEventsCount: number;
  pendingEventsCount: number;
}

export default function UserProfileController() {
  const router = useRouter();
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
          photoUri: resolveApiImageUrl(apiData.profilePic),
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

  const handleUpdateProfile = async ({ name, photo }: UserProfileUpdate) => {
    const trimmedName = name.trim();

    if (trimmedName !== profile?.name) {
      await updateMyProfile({ name: trimmedName });
    }

    if (photo) {
      await updateUserProfilePicture(photo);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth');
  };

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
      onLogout={handleLogout}
      onUpdateProfile={handleUpdateProfile}
    />
  );
}
