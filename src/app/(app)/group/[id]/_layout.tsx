import { Stack } from 'expo-router/stack';

export default function GroupLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ title: 'Group' }}
      />
      <Stack.Screen
        name="create-event"
        options={{ presentation: 'modal', title: 'Create event' }}
      />
      <Stack.Screen
        name="info"
        options={{ title: 'Group info' }}
      />
      <Stack.Screen
        name="leave"
        options={{ presentation: 'modal', title: 'Leave group' }}
      />
    </Stack>
  );
}
