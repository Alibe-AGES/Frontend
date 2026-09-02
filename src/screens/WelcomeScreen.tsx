import { Text, View } from 'react-native';

interface WelcomeScreenProps {
  name: string;
}

export function WelcomeScreen({ name }: WelcomeScreenProps) {
  return (
    <View className="bg-canvas flex-1 items-center justify-center">
      <Text className="text-ink text-2xl font-bold">Welcome to screen {name}</Text>
    </View>
  );
}
