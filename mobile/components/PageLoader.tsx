import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function PageLoader() {
  return (
    <SafeAreaView className="flex-1 justify-center items-center">
      <ActivityIndicator size="small" />
    </SafeAreaView>
  );
}

export default PageLoader;
