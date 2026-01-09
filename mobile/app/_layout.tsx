import Providers from '@/config/providers';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { configureReanimatedLogger, ReanimatedLogLevel } from 'react-native-reanimated';
import { useAuth } from '@clerk/clerk-expo';
import PageLoader from '@/components/PageLoader';
import { useEffect } from 'react';

import './global.css';

// Отключает строгие предупреждения
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

function InitialLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, segments]);

  if (!isLoaded) {
    return <PageLoader />;
  }

  const inAuthGroup = segments[0] === '(auth)';

  if (isSignedIn && inAuthGroup) {
    return <PageLoader />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    // Inter
    'Inter-Light': require('../assets/fonts/Inter/Inter-Light.otf'),
    'Inter-Regular': require('../assets/fonts/Inter/Inter-Regular.otf'),
    'Inter-Medium': require('../assets/fonts/Inter/Inter-Medium.otf'),
    'Inter-SemiBold': require('../assets/fonts/Inter/Inter-SemiBold.otf'),
    'Inter-Bold': require('../assets/fonts/Inter/Inter-Bold.otf'),
    'Inter-ExtraBold': require('../assets/fonts/Inter/Inter-ExtraBold.otf'),

    // Raleway
    'Raleway-Light': require('../assets/fonts/Raleway/Raleway-Light.ttf'),
    'Raleway-Regular': require('../assets/fonts/Raleway/Raleway-Regular.ttf'),
    'Raleway-Medium': require('../assets/fonts/Raleway/Raleway-Medium.ttf'),
    'Raleway-SemiBold': require('../assets/fonts/Raleway/Raleway-SemiBold.ttf'),
    'Raleway-Bold': require('../assets/fonts/Raleway/Raleway-Bold.ttf'),
    'Raleway-ExtraBold': require('../assets/fonts/Raleway/Raleway-ExtraBold.ttf'),
  });

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Providers>
        <InitialLayout />
      </Providers>
    </GestureHandlerRootView>
  );
}
