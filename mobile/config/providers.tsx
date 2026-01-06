import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import React from 'react';
import { Toaster } from 'sonner-native';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env'
  );
}

// Создаем клиента для React Query (он управляет кэшем запросов)
const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
      <QueryClientProvider client={queryClient}>
        {/* Рендерим само приложение (все экраны) */}
        {children}

        {/* Подключаем уведомления (Toaster) */}
        <Toaster position="bottom-center" />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
