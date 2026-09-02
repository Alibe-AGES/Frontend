import { Text, View } from 'react-native';

interface WelcomeScreenProps {
  name: string;
}

export function WelcomeScreen({ name }: WelcomeScreenProps) {
  return (
    <View className="flex-1 items-center justify-center bg-canvas">
      <Text className="text-2xl font-bold text-ink">Welcome to screen {name}</Text>
    </View>
  );
}
