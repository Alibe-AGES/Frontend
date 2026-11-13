import { Stack } from 'expo-router/stack';

export default function GroupLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="match" />
      <Stack.Screen
        name="create-event"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="event-created"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen name="info" />
      <Stack.Screen
        name="notifications"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="leave"
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="day/[date]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
