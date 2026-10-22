import { useRouter } from 'expo-router';

import { useAuth } from '@/server/mock/useAuth';

export interface UseDefaultProfileButtonControllerParams {
  groupId?: string;
}

export const useDefaultProfileButtonController = ({
  groupId,
}: UseDefaultProfileButtonControllerParams) => {
  const router = useRouter();
  const { userId } = useAuth();

  const openProfile = () => {
    router.push({
      pathname: '/(profile)/profile/[userId]',
      params: { userId, ...(groupId ? { groupId } : {}) },
    });
  };

  return { openProfile };
};
