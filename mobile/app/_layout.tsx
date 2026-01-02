import Providers from '@/config/providers';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import './global.css';

export default function RootLayout() {
  const [loaded] = useFonts({
    // Inter
    'Inter-Light': require('../assets/fonts/Inter/Inter-Light.otf'),
    'Inter-Regular': require('../assets/fonts/Inter/Inter-Regular.otf'),
    'Inter-Medium': require('../assets/fonts/Inter/Inter-Medium.otf'),
    'Inter-SemiBold': require('../assets/fonts/Inter/Inter-SemiBold.otf'),
    'Inter-Bold': require('../assets/fonts/Inter/Inter-Bold.otf'),

    // Raleway
    'Raleway-Light': require('../assets/fonts/Raleway/Raleway-Light.ttf'),
    'Raleway-Regular': require('../assets/fonts/Raleway/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway/Raleway-Medium.ttf'),
    'Raleway-SemiBold': require('../assets/fonts/Raleway/Raleway-SemiBold.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway/Raleway-Bold.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <Providers>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)/screens" />
        </Stack>
      </Providers>
    </GestureHandlerRootView>
  );
}
