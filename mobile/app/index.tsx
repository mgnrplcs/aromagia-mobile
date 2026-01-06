import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';

import PageLoader from '@/components/PageLoader';

export default function IndexPage() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return <PageLoader />;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/sign-in" />;
}
