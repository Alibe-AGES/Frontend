import { useRouter, type Href } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { useEffect, useRef } from 'react';

export function PushNotifications() {
  const router = useRouter();
  const handledResponses = useRef(new Set<string>());

  useEffect(() => {
    let isActive = true;

    const handleResponse = (response: Notifications.NotificationResponse) => {
      const identifier = response.notification.request.identifier;
      const data = response.notification.request.content.data;
      const groupId = data?.groupId;

      if (
        !isActive ||
        handledResponses.current.has(identifier) ||
        typeof groupId !== 'string' ||
        groupId.length === 0
      ) {
        return;
      }

      handledResponses.current.add(identifier);
      router.push({
        pathname: '/group/[id]/notifications',
        params: { id: groupId },
      } as unknown as Href);
      Notifications.clearLastNotificationResponse();
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(handleResponse);

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse) {
      handleResponse(lastResponse);
    }

    return () => {
      isActive = false;
      subscription.remove();
    };
  }, [router]);

  return null;
}
