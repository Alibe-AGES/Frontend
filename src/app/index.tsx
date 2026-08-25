import { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

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

export const CustomText = ({ children }: PropsWithChildren) => <Text style={styles.text}>{children}</Text>;

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <CustomText>Welcome!</CustomText>
    </View>
  );
}
