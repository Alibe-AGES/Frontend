import { Button } from '@/components/Button';
import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export const CustomText = ({ children }: PropsWithChildren) => (
  <Text style={styles.text}>{children}</Text>
);

export default function HomeScreen() {
  const handleLoginPress = () => undefined;

  return (
    <View style={styles.container}>
      <CustomText>Welcome!</CustomText>
      <Button
        title="Entrar"
        onPress={handleLoginPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
});
