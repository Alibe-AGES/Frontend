import { Text, type TextProps } from 'react-native';

interface ExpoIconProps extends TextProps {
  name: string;
  size?: number;
  color?: string;
}

function ExpoIconMock({ name, size, color, style, ...props }: ExpoIconProps) {
  return (
    <Text
      {...props}
      style={[{ color, fontSize: size }, style]}
    >
      {name}
    </Text>
  );
}

export const Ionicons = ExpoIconMock;
