import { Platform } from 'react-native';

// Exemplo de constante fixa do app.
export const STORAGE_KEYS = {
  token: '@alibe:token',
};

// No emulador Android, troque para http://10.0.2.2:3000 (localhost aponta para o próprio emulador).
const LOCAL_API_URL = 'http://localhost:3000';

// IP da máquina na rede local, usado quando o app roda em um dispositivo físico via Expo Go.
const LAN_API_URL = 'http://192.000.0.00:8081';

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === 'web' ? LOCAL_API_URL : LAN_API_URL);
