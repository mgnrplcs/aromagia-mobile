import { View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SafeScreen({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flex: 1 }}>{children}</View>
    </SafeAreaView>
  );
}
