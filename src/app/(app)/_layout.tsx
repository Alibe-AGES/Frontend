import { Stack } from 'expo-router/stack';

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="groups"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="create-group"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
