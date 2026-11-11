import type { AppNotification } from '@/components/NotificationCard';
import { NotificationsScreen } from '@/screens/Notifications';
import { getEventDetails } from '@/server/events';
import { getGroup, type GroupDetails } from '@/server/groups';
import {
  getGroupNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from '@/server/notifications';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';

const LOAD_ERROR = 'Não foi possível carregar as notificações.';
const DISMISS_ERROR = 'Não foi possível remover a notificação. Tente de novo.';
const CLEAR_ERROR = 'Não foi possível limpar as notificações. Tente de novo.';

function mergeNotifications(current: AppNotification[], next: AppNotification[]) {
  const knownIds = new Set(current.map((notification) => notification.id));

  return [...current, ...next.filter((notification) => !knownIds.has(notification.id))];
}

export default function NotificationsController() {
  const router = useRouter();
  const { id: groupId } = useLocalSearchParams<{ id: string }>();

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!groupId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const [groupResult, notificationsResult] = await Promise.allSettled([
      getGroup(groupId),
      getGroupNotifications(groupId, 1),
    ]);

    // O cabeçalho do grupo continua útil mesmo quando a lista falha.
    if (groupResult.status === 'fulfilled') {
      setGroup(groupResult.value);
    } else {
      console.error('Erro ao carregar o grupo', groupResult.reason);
    }

    if (notificationsResult.status === 'fulfilled') {
      setNotifications(notificationsResult.value.notifications);
      setHasMore(notificationsResult.value.hasMore);
      setPage(1);
    } else {
      console.error('Erro ao carregar notificações', notificationsResult.reason);
      setErrorMessage(LOAD_ERROR);
    }

    setIsLoading(false);
  }, [groupId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleLoadMore = async () => {
    if (!groupId || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const nextPage = await getGroupNotifications(groupId, page + 1);
      setNotifications((current) => mergeNotifications(current, nextPage.notifications));
      setHasMore(nextPage.hasMore);
      setPage(page + 1);
    } catch (error) {
      console.error('Erro ao carregar mais notificações', error);
      setErrorMessage(LOAD_ERROR);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const openGroupCalendar = () => {
    if (!groupId) {
      return;
    }

    router.navigate({ pathname: '/group/[id]', params: { id: groupId } });
  };

  const openEvent = async (eventId: string) => {
    if (!groupId) {
      return;
    }

    try {
      const event = await getEventDetails(eventId);
      const date = event.date?.slice(0, 10);

      if (!date) {
        openGroupCalendar();
        return;
      }

      router.push({
        pathname: '/group/[id]/day/[date]',
        params: { id: event.groupId, date },
      });
    } catch (error) {
      console.error('Erro ao abrir o encontro da notificação', error);
      openGroupCalendar();
    }
  };

  const handleActionPress = (notification: AppNotification) => {
    if (notification.type === 'createdEvent' && notification.eventId) {
      void openEvent(notification.eventId);
      return;
    }

    if (notification.type === 'match' && notification.locationId && groupId) {
      router.push({
        pathname: '/group/[id]/experiences/[placeId]',
        params: {
          id: groupId,
          placeId: notification.locationId,
          isStoredLocation: 'true',
        },
      });
      return;
    }

    openGroupCalendar();
  };

  const handleDismissNotification = async (notificationId: string) => {
    if (!groupId) {
      return;
    }

    const previous = notifications;
    setNotifications((current) => current.filter((item) => item.id !== notificationId));

    try {
      await markNotificationAsRead(groupId, notificationId);
    } catch (error) {
      console.error('Erro ao marcar notificação como lida', error);
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
      await markAllNotificationsAsRead(groupId);
      setNotifications([]);
      setHasMore(false);
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
      hasMore={hasMore}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      isClearing={isClearing}
      errorMessage={errorMessage}
      onPressNotification={handleActionPress}
      onActionPressNotification={handleActionPress}
      onDismissNotification={(id) => void handleDismissNotification(id)}
      onClearNotifications={() => void handleClearNotifications()}
      onLoadMore={() => void handleLoadMore()}
      onRetry={() => void load()}
    />
  );
}
