import { useRouter } from 'expo-router';

import { NavigationBarAction } from '@/components/NavigationBar/NavigationBar.types';
import { useAuth } from '@/server/mock/useAuth';

export interface UseDefaultNavigationBarControllerParams {
  groupId: string;
}

export const useDefaultNavigationBarController = ({
  groupId,
}: UseDefaultNavigationBarControllerParams) => {
  const router = useRouter();
  const { userId } = useAuth();

  const navigate = (action: NavigationBarAction) => {
    switch (action) {
      case 'create':
        router.navigate({ pathname: '/group/[id]/create-event', params: { id: groupId } });
        break;
      case 'matches':
        router.navigate({ pathname: '/group/[id]/experiences/new', params: { id: groupId } });
        break;
      case 'search':
        router.navigate({ pathname: '/group/[id]/experiences', params: { id: groupId } });
        break;
      case 'memories':
        router.navigate({ pathname: '/group/[id]/memories', params: { id: groupId } });
        break;
      case 'groups':
        router.navigate('/groups');
        break;
      case 'profile':
        router.navigate({
          pathname: '/(profile)/profile/[userId]',
          params: { userId, ...(groupId ? { groupId } : {}) },
        });
        break;
    }
  };

  return { navigate };
};
