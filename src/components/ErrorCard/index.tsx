import { Pressable, Text, View } from 'react-native';

export interface ErrorCardProps {
  readonly message: string;
  readonly onRetry?: () => void;
  readonly testID?: string;
}

export function ErrorCard({ message, onRetry, testID = 'alibe-error-card' }: ErrorCardProps) {
  return (
    <View
      className="items-center justify-center gap-3 rounded-3xl bg-surface p-6"
      testID={testID}
    >
      <Text className="text-center font-poppins text-sm text-ink-soft">{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Tentar novamente"
          onPress={onRetry}
          className="rounded-full bg-ink px-5 py-2 active:opacity-75"
          testID={`${testID}-retry`}
        >
          <Text className="font-poppins-semibold text-sm text-white">Tentar novamente</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
