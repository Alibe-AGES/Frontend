import { Href } from 'expo-router';
import { PressableProps } from 'react-native';

export interface BackStrategy {
  handleBack: () => void | Promise<void>;
  isLoading?: boolean;
}

export type UseBackStrategyHook = () => BackStrategy;

export interface BackButtonProps extends Omit<PressableProps, 'children'> {
  useController?: UseBackStrategyHook;
  accessibilityLabel?: string;
  fallbackHref?: Href;
  className?: string;
}
