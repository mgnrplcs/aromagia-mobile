import { useSSO, useClerk } from '@clerk/clerk-expo';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

// Подготовка браузера для Android
export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

function useSocialAuth() {
  useWarmUpBrowser();

  const { signOut } = useClerk();
  const { startSSOFlow } = useSSO();
  const [loadingStrategy, setLoadingStrategy] = useState<string | null>(null);

  const handleSocialAuth = useCallback(
    async (strategy: 'oauth_google' | 'oauth_apple') => {
      setLoadingStrategy(strategy);

      try {
        const redirectUrl = AuthSession.makeRedirectUri({
          path: '/',
          scheme: 'aromagiamobile',
        });

        const { createdSessionId, setActive } = await startSSOFlow({
          strategy,
          redirectUrl,
        });

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
          return;
        } else {
          setLoadingStrategy(null);
        }
      } catch (err: any) {
        console.log('OAuth error:', err);

        setLoadingStrategy(null);

        const errorMessage = err?.errors?.[0]?.message || err?.message || '';

        // Обработка рассинхронизации сессии или повторного входа
        if (errorMessage.includes('signed out') || err?.code === 'session_exists') {
          await signOut();

          if (err?.code === 'session_exists') return;

          toast.info('Обновление сессии. Попробуйте еще раз.');
          return;
        }

        const provider = strategy === 'oauth_google' ? 'Google' : 'Apple';
        if (!errorMessage.includes('user cancelled')) {
          toast.error('Ошибка входа', {
            description: err.errors?.[0]?.longMessage || `Не удалось войти через ${provider}`,
          });
        }
      }
    },
    [startSSOFlow, signOut]
  );

  return { loadingStrategy, handleSocialAuth };
}

export default useSocialAuth;
