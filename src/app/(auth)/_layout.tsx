import { Stack } from 'expo-router/stack';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Back' }}>
      <Stack.Screen
        name="sign-up"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
