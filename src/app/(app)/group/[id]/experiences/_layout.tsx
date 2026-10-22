import { Stack } from 'expo-router/stack';

export default function ExperiencesLayout() {
  return (
    <Stack screenOptions={{ title: 'Experiences' }}>
      <Stack.Screen
        name="[placeId]"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
