import { View } from 'react-native';

export default function SvgMock(props: Record<string, unknown>) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      {...props}
    />
  );
}
