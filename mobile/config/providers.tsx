import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import React from 'react';
import { Toaster } from 'sonner-native';
// import { StripeProvider } from '@stripe/stripe-react-native';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const stripePublishableKey = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!;

if (!clerkPublishableKey) {
  throw new Error('Не задан EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY в .env файле');
}

if (!stripePublishableKey) {
  throw new Error('Не задан EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY в .env файле');
}

// Создаем клиента для React Query (он управляет кэшем запросов)
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={clerkPublishableKey}>
      <QueryClientProvider client={queryClient}>
        {/* <StripeProvider publishableKey={stripePublishableKey}> */}
        <>
          {/* Рендерим само приложение */}
          {children}
          {/* Подключаем уведомления (Toaster) */}
          <Toaster position="bottom-center" />
        </>
        {/* </StripeProvider> */}
      </QueryClientProvider>
    </ClerkProvider>
  );
}
