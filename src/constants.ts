import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Exemplo de constante fixa do app.
export const STORAGE_KEYS = {
  token: '@alibe:token',
};

// No emulador Android, troque para http://10.0.2.2:3000 (localhost aponta para o próprio emulador).
const LOCAL_API_URL = 'http://localhost:3000';

// IP da máquina na rede local, usado quando o app roda em um dispositivo físico via Expo Go.
const LAN_API_URL = 'https://192.000.0.00:3000';

const extraApiBaseUrl: unknown = Constants.expoConfig?.extra?.apiBaseUrl;
const processApiBaseUrl = (
  process as {
    env: { EXPO_PUBLIC_API_URL?: string; ENV_API_BASE_URL?: string };
  }
).env.EXPO_PUBLIC_API_URL;
const configuredApiBaseUrl =
  typeof extraApiBaseUrl === 'string' && extraApiBaseUrl.length > 0
    ? extraApiBaseUrl
    : (processApiBaseUrl ??
      (process as { env: { ENV_API_BASE_URL?: string } }).env.ENV_API_BASE_URL);

export const API_BASE_URL: string =
  typeof configuredApiBaseUrl === 'string' && configuredApiBaseUrl.length > 0
    ? configuredApiBaseUrl.replace(/\/$/, '')
    : Platform.OS === 'web'
      ? LOCAL_API_URL
      : LAN_API_URL;
