import { updateCurrentDevicePushToken } from '@/server/push-notifications';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { synchronizePushToken } from './synchronize-push-token';

let mockIsPhysicalDevice = true;

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    easConfig: { projectId: '0fe4c9c6-8bca-4a1e-8506-7dca9c7901e7' },
  },
}));

jest.mock('expo-device', () => ({
  get isDevice() {
    return mockIsPhysicalDevice;
  },
}));

jest.mock('expo-notifications', () => ({
  AndroidImportance: { MAX: 5 },
  PermissionStatus: { GRANTED: 'granted' },
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  getExpoPushTokenAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
}));

jest.mock('@/server/push-notifications', () => ({
  updateCurrentDevicePushToken: jest.fn(),
}));

const mockGetPermissions = Notifications.getPermissionsAsync as jest.MockedFunction<
  typeof Notifications.getPermissionsAsync
>;
const mockRequestPermissions = Notifications.requestPermissionsAsync as jest.MockedFunction<
  typeof Notifications.requestPermissionsAsync
>;
const mockGetExpoPushToken = Notifications.getExpoPushTokenAsync as jest.MockedFunction<
  typeof Notifications.getExpoPushTokenAsync
>;
const mockUpdateToken = updateCurrentDevicePushToken as jest.MockedFunction<
  typeof updateCurrentDevicePushToken
>;
const mockConstants = Constants as unknown as {
  easConfig: { projectId?: string } | null;
  expoConfig?: { extra?: { eas?: unknown } };
};
const originalPlatform = Platform.OS;

describe('synchronizePushToken', () => {
  beforeEach(() => {
    mockIsPhysicalDevice = true;
    mockConstants.easConfig = { projectId: '0fe4c9c6-8bca-4a1e-8506-7dca9c7901e7' };
    mockConstants.expoConfig = undefined;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    mockGetPermissions.mockResolvedValue({ status: 'granted' } as never);
    mockRequestPermissions.mockResolvedValue({ status: 'granted' } as never);
    mockGetExpoPushToken.mockResolvedValue({ data: 'ExpoPushToken[test-token]' } as never);
    mockUpdateToken.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('gets an Expo token with the EAS project id and sends it to the backend', async () => {
    await expect(synchronizePushToken()).resolves.toBe('registered');

    expect(mockGetExpoPushToken).toHaveBeenCalledWith({
      projectId: '0fe4c9c6-8bca-4a1e-8506-7dca9c7901e7',
    });
    expect(mockUpdateToken).toHaveBeenCalledWith('ExpoPushToken[test-token]');
  });

  test('asks for permission when it has not been granted yet', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' } as never);

    await expect(synchronizePushToken()).resolves.toBe('registered');

    expect(mockRequestPermissions).toHaveBeenCalledTimes(1);
  });

  test('does not request a token when permission is denied', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'denied' } as never);
    mockRequestPermissions.mockResolvedValue({ status: 'denied' } as never);

    await expect(synchronizePushToken()).resolves.toBe('permission-denied');

    expect(mockGetExpoPushToken).not.toHaveBeenCalled();
    expect(mockUpdateToken).not.toHaveBeenCalled();
  });

  test('does nothing on emulators and simulators', async () => {
    mockIsPhysicalDevice = false;

    await expect(synchronizePushToken()).resolves.toBe('unsupported');

    expect(mockGetPermissions).not.toHaveBeenCalled();
    expect(mockUpdateToken).not.toHaveBeenCalled();
  });

  test('does nothing on web even when device detection reports a physical device', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });

    await expect(synchronizePushToken()).resolves.toBe('unsupported');

    expect(mockGetPermissions).not.toHaveBeenCalled();
    expect(mockUpdateToken).not.toHaveBeenCalled();
  });

  test('creates the default notification channel on Android', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });

    await expect(synchronizePushToken()).resolves.toBe('registered');

    expect(Notifications.setNotificationChannelAsync).toHaveBeenCalledWith('default', {
      name: 'Notificações',
      importance: Notifications.AndroidImportance.MAX,
    });
  });

  test('uses the Expo config project id when the native EAS config is unavailable', async () => {
    mockConstants.easConfig = null;
    mockConstants.expoConfig = { extra: { eas: { projectId: 'fallback-project-id' } } };

    await expect(synchronizePushToken()).resolves.toBe('registered');

    expect(mockGetExpoPushToken).toHaveBeenCalledWith({ projectId: 'fallback-project-id' });
  });

  test('fails safely when no EAS project id is configured', async () => {
    const consoleWarning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockConstants.easConfig = null;
    mockConstants.expoConfig = { extra: { eas: null } };

    await expect(synchronizePushToken()).resolves.toBe('failed');

    expect(mockGetExpoPushToken).not.toHaveBeenCalled();
    expect(mockUpdateToken).not.toHaveBeenCalled();
    expect(consoleWarning).toHaveBeenCalledWith(
      'Não foi possível sincronizar o token de notificações.',
      expect.objectContaining({ message: 'EAS projectId não configurado' })
    );
    consoleWarning.mockRestore();
  });

  test('does not block authentication when synchronization fails', async () => {
    const consoleWarning = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    mockUpdateToken.mockRejectedValue(new Error('Backend unavailable'));

    await expect(synchronizePushToken()).resolves.toBe('failed');

    expect(consoleWarning).toHaveBeenCalled();
    consoleWarning.mockRestore();
  });
});
