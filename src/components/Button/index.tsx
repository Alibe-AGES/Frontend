import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

// Exemplo de componente. Padrão desejável: uma pasta por componente,
// com index.tsx dentro.
interface ButtonProps {
  title: string;
  onPress?: () => void;
}

export function Button({ title, onPress }: ButtonProps) {
  return React.createElement(TouchableOpacity, { onPress }, React.createElement(Text, null, title));
}
