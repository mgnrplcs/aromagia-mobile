import useSocialAuth from '@/hooks/useSocialAuth';
import { ActivityIndicator, Image, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Импорт LinearGradient удален

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

      {/* Контент */}
      <SafeAreaView className="flex-1 tracking-wide justify-end px-6 pb-6">
        <View className="mb-6 items-center justify-center">
          {/* Категория */}
          <View className="bg-white/10 px-4 py-1.5 rounded-full -mb-0.5 border border-white/30 self-center">
            <Text className="text-white/90 font-inter-bold text-xs uppercase tracking-[1.5px]">
              Магазин парфюмерии
            </Text>
          </View>

          {/* Заголовок */}
          <Text className="text-white font-raleway-bold text-6xl leading-tight shadow-lg text-center">
            Аромагия
          </Text>
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
                <Text className="text-white font-inter-semibold mb-0.5 text-[17px]">
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
                <Text className="text-black font-inter-semibold mb-0.5 text-[17px]">
                  Продолжить с Google
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Юридическая информация */}
        <Text className="text-center text-white/80 text-sm leading-5 mt-4 font-inter-semibold">
          Авторизовываясь, Вы соглашаетесь с нашей{' '}
          <Text className="text-white/90 underline">Политикой конфиденциальности</Text>
          {' и '}
          <Text className="text-white/90 underline">использованием cookie</Text>
        </Text>
      </SafeAreaView>
    </View>
  );
};

export default AuthScreen;
