import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Exemplo de constante fixa do app.
export const STORAGE_KEYS = {
  token: '@alibe:token',
};

const extraApiBaseUrl: unknown = Constants.expoConfig?.extra?.apiBaseUrl;
const extraMobileApiBaseUrl: unknown = Constants.expoConfig?.extra?.mobileApiBaseUrl;
const processApiBaseUrl: unknown = process.env.EXPO_PUBLIC_API_URL;
const processFallbackApiBaseUrl: unknown = process.env.ENV_API_BASE_URL;
const processMobileApiBaseUrl: unknown = process.env.EXPO_PUBLIC_API_URL_MOBILE;
const configuredApiBaseUrl =
  typeof extraApiBaseUrl === 'string' && extraApiBaseUrl.length > 0
    ? extraApiBaseUrl
    : (processApiBaseUrl ?? processFallbackApiBaseUrl);
const configuredMobileApiBaseUrl =
  typeof extraMobileApiBaseUrl === 'string' && extraMobileApiBaseUrl.length > 0
    ? extraMobileApiBaseUrl
    : processMobileApiBaseUrl;

export function resolveApiBaseUrl(
  webApiBaseUrl: string,
  mobileApiBaseUrl: string | undefined,
  platform: string
): string {
  const apiBaseUrl = platform === 'web' ? webApiBaseUrl : (mobileApiBaseUrl ?? webApiBaseUrl);
  return apiBaseUrl.replace(/\/$/, '');
}

export const API_BASE_URL = resolveApiBaseUrl(
  typeof configuredApiBaseUrl === 'string' && configuredApiBaseUrl.length > 0
    ? configuredApiBaseUrl
    : 'http://localhost:3000',
  typeof configuredMobileApiBaseUrl === 'string' && configuredMobileApiBaseUrl.length > 0
    ? configuredMobileApiBaseUrl
    : undefined,
  Platform.OS
);
