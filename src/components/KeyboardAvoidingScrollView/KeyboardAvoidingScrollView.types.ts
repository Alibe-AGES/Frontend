import type { ScrollViewProps } from 'react-native';

export interface KeyboardAvoidingScrollViewProps extends ScrollViewProps {
  /** Distância entre o topo da área visível e o campo focado após rolar. */
  readonly topOffset?: number;
  readonly className?: string;
  readonly contentContainerClassName?: string;
}
