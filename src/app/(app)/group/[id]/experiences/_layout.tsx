import { Stack } from 'expo-router/stack';

export default function ExperiencesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="[placeId]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
