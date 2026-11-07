import GoogleLogo from '@/assets/images/google.svg';
import { theme } from '@/theme';
import { ActivityIndicator, Pressable, View } from 'react-native';
import tw from 'twrnc';

export interface GoogleButtonProps {
  onPress?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  testID?: string;
}

export function GoogleButton({
  onPress,
  disabled = false,
  isLoading = false,
  testID = 'google-button',
}: GoogleButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Continuar com Google"
      accessibilityState={{ disabled: isDisabled, busy: isLoading }}
      className={`size-14 items-center justify-center rounded-full bg-white ${
        isDisabled ? 'opacity-50' : 'opacity-100'
      }`}
      disabled={isDisabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => tw`${pressed ? 'opacity-75' : ''}`}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator
          color={theme.colors.ink}
          testID={`${testID}-loading`}
        />
      ) : (
        <View className="size-8">
          <GoogleLogo
            width="100%"
            height="100%"
          />
        </View>
      )}
    </Pressable>
  );
}
