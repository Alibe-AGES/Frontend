import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

// Without a handler, expo-notifications drops notifications that arrive while the app is open:
// they only show when the app is in the background. This shows them as a banner in the foreground too.
// Set at import time so it is in place before the first notification arrives.
Notifications.setNotificationHandler({
  handleNotification: () =>
    Promise.resolve({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
});

export function PushNotifications() {
  const router = useRouter();
  const handledResponses = useRef(new Set<string>());

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

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
      });
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
