import { Stack } from 'expo-router/stack';

export default function AppLayout() {
  return <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Groups' }} />;
}
