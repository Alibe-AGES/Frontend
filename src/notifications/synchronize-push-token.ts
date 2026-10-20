import { updateCurrentDevicePushToken } from '@/server/push-notifications';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type PushTokenSynchronizationResult =
  'registered' | 'unsupported' | 'permission-denied' | 'failed';

function easProjectId(): string | null {
  if (Constants.easConfig?.projectId) {
    return Constants.easConfig.projectId;
  }

  const easConfig: unknown = Constants.expoConfig?.extra?.eas;
  if (typeof easConfig !== 'object' || easConfig === null || !('projectId' in easConfig)) {
    return null;
  }

  const projectId = (easConfig as { projectId?: unknown }).projectId;
  return typeof projectId === 'string' && projectId.length > 0 ? projectId : null;
}

async function grantedNotificationPermission(): Promise<boolean> {
  let permissions = await Notifications.getPermissionsAsync();

  if (permissions.status !== Notifications.PermissionStatus.GRANTED) {
    permissions = await Notifications.requestPermissionsAsync();
  }

  return permissions.status === Notifications.PermissionStatus.GRANTED;
}

export async function synchronizePushToken(): Promise<PushTokenSynchronizationResult> {
  if (Platform.OS === 'web' || !Device.isDevice) {
    return 'unsupported';
  }

  try {
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificações',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    if (!(await grantedNotificationPermission())) {
      return 'permission-denied';
    }

    const projectId = easProjectId();
    if (!projectId) {
      throw new Error('EAS projectId não configurado');
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await updateCurrentDevicePushToken(token);

    return 'registered';
  } catch (error) {
    console.warn('Não foi possível sincronizar o token de notificações.', error);
    return 'failed';
  }
}
