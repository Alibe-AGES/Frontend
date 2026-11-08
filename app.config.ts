import { ConfigContext, ExpoConfig } from 'expo/config';
import 'tsx/cjs';

// Static settings live in app.json; this file only adds values that come from the environment.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'Alibe',
  slug: config.slug ?? 'alibe',
  extra: {
    ...config.extra,
    apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? process.env.ENV_API_BASE_URL,
  },
});
