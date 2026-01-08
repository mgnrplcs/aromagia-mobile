import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function PageLoader() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center min-h-[450px]">
      <ActivityIndicator size="large" color="#3B82F6" />
    </SafeAreaView>
  );
}

export default PageLoader;
