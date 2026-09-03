import '@/global.css';
import { Stack } from 'expo-router/stack';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(profile)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}