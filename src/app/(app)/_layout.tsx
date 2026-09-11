import { Stack } from 'expo-router/stack';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Groups' }}>
      <Stack.Screen
        name="create-group"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
