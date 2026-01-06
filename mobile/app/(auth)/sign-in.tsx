import useSocialAuth from '@/hooks/useSocialAuth';
import { ActivityIndicator, Image, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

const AuthScreen = () => {
  const { loadingStrategy, handleSocialAuth } = useSocialAuth();

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      {/* Фоновое изображение */}
      <Image
        source={require('@/assets/screens/onboarding.png')}
        className="absolute w-full h-full"
        resizeMode="cover"
      />

      {/* Затемнение */}
      <View className="absolute w-full h-full bg-black/25" />

      {/* Градиент */}
      <LinearGradient
        colors={['transparent', 'transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', 'black']}
        locations={[0, 0.4, 0.6, 0.85, 1]}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: '100%',
        }}
      />

      {/* Контент */}
      <SafeAreaView className="flex-1 tracking-wide justify-end px-6 pb-8">
        <View className="mb-6 items-center">
          <Text className="text-white/70 font-inter-bold text-xs uppercase tracking-[4px] mb-3">
            Парфюмерный магазин
          </Text>
          <Text className="text-white font-raleway-bold text-5xl text-center">Аромагия ✨</Text>
        </View>

        <View className="gap-y-4 w-full">
          {/* Кнопка Apple */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-[#1A1A1A] h-14 rounded-full w-full border border-white/10"
            onPress={() => handleSocialAuth('oauth_apple')}
            disabled={loadingStrategy !== null}
            activeOpacity={0.8}
          >
            {loadingStrategy === 'oauth_apple' ? (
              <ActivityIndicator color="white" />
            ) : (
              <View className="flex-row items-center">
                <Image
                  source={require('@/assets/images/icons/apple.png')}
                  className="w-5 h-5 mr-3 mb-0.5"
                  style={{ tintColor: 'white' }}
                  resizeMode="contain"
                />
                <Text className="text-white font-inter-semibold text-[17px]">
                  Продолжить с Apple
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Кнопка Google */}
          <TouchableOpacity
            className="flex-row items-center justify-center bg-white h-14 rounded-full w-full"
            onPress={() => handleSocialAuth('oauth_google')}
            disabled={loadingStrategy !== null}
            activeOpacity={0.9}
          >
            {loadingStrategy === 'oauth_google' ? (
              <ActivityIndicator color="black" />
            ) : (
              <View className="flex-row items-center">
                <Image
                  source={require('@/assets/images/icons/google.webp')}
                  className="w-5 h-5 mr-3"
                  resizeMode="contain"
                />
                <Text className="text-black font-inter-semibold text-[17px]">
                  Продолжить с Google
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Юридическая информация */}
        <Text className="text-center text-white/40 text-[11px] leading-4 mt-5 font-inter-medium">
          Авторизовываясь, вы соглашаетесь с нашими{' '}
          <Text className="text-white/70 underline">Правилами</Text>
          {', '}
          <Text className="text-white/70 underline">Политикой конфиденциальности</Text>
          {' и '}
          <Text className="text-white/70 underline">использованием cookie</Text>.
        </Text>
      </SafeAreaView>
    </View>
  );
};

export default AuthScreen;
