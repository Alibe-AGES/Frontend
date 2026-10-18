import type { AppNotification } from '@/components/NotificationCard';
import { NotificationsScreen } from '@/screens/Notifications';
import { getGroup, type GroupDetails } from '@/server/groups';
import {
  clearGroupNotifications,
  dismissNotification,
  getGroupNotifications,
} from '@/server/notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

const LOAD_ERROR = 'Não foi possível carregar as notificações.';
const DISMISS_ERROR = 'Não foi possível remover a notificação. Tente de novo.';
const CLEAR_ERROR = 'Não foi possível limpar as notificações. Tente de novo.';

export default function NotificationsController() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [groupData, groupNotifications] = await Promise.all([
        getGroup(groupId),
        getGroupNotifications(groupId),
      ]);

      setGroup(groupData);
      setNotifications(groupNotifications);
    } catch (error) {
      console.error('Erro ao carregar notificações', error);
      setErrorMessage(LOAD_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handlePressNotification = (notification: AppNotification) => {
    router.navigate({ pathname: '/group/[id]', params: { id: notification.groupId } });
  };

  const handleDismissNotification = async (notificationId: string) => {
    if (!groupId) {
      return;
    }

    const previous = notifications;
    setNotifications((current) => current.filter((item) => item.id !== notificationId));

    try {
      await dismissNotification(groupId, notificationId);
    } catch (error) {
      console.error('Erro ao remover notificação', error);
      setNotifications(previous);
      setErrorMessage(DISMISS_ERROR);
    }
  };

  const handleClearNotifications = async () => {
    if (!groupId) {
      return;
    }

    setIsClearing(true);

    try {
      await clearGroupNotifications(groupId);
      setNotifications([]);
    } catch (error) {
      console.error('Erro ao limpar notificações', error);
      setErrorMessage(CLEAR_ERROR);
    } finally {
      setIsClearing(false);
    }
  };

  if (!groupId) {
    return null;
  }

  return (
    <NotificationsScreen
      groupId={groupId}
      groupName={group?.name ?? ''}
      groupPhoto={group?.profilePic ?? null}
      membersText={group?.participants.map((member) => member.name).join(', ') ?? ''}
      notifications={notifications}
      isLoading={isLoading}
      isClearing={isClearing}
      errorMessage={errorMessage}
      onPressNotification={handlePressNotification}
      onDismissNotification={(id) => void handleDismissNotification(id)}
      onClearNotifications={() => void handleClearNotifications()}
      onRetry={() => void load()}
    />
  );
}
