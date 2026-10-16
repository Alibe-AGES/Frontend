import type { ScrollViewProps } from 'react-native';

export interface KeyboardAvoidingScrollViewProps extends ScrollViewProps {
  /** Distância entre o topo da área visível e o campo focado após rolar. */
  readonly topOffset?: number;
  /** Espaçamento adicional na base quando o teclado está visível. */
  readonly bottomOffset?: number;
  readonly className?: string;
  readonly contentContainerClassName?: string;
}
