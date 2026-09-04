import { Stack } from 'expo-router/stack';

export default function ProfileLayout() {
  return <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Back' }} />;
}
