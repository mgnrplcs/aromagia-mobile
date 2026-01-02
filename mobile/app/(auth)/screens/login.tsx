import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const loginForm = useForm<LoginFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSingUpNavigation = () => {
    router.push('/screens/register');
  };

  const loginMutation = { isPending: false };

  const onLoginSubmit = (data: LoginFormData) => {
    // TODO: Вызвать мутацию для авторизации
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          className="px-5"
        >
          {/* Заголовок */}
          <View className="mt-12 mb-6 flex-row items-center">
            <Image
              source={require('@/assets/images/icons/aromagia_sm.png')}
              className="w-14 h-14 mr-3"
              resizeMode="contain"
            />

            <View className="flex-1">
              <Text className="text-3xl font-inter-bold text-gray-900 mb-1">С возвращением!</Text>
              <Text className="text-gray-400 text-base font-inter">Мы рады видеть вас снова</Text>
            </View>
          </View>

          <View className="gap-6 mt-4">
            {/* Эл. почта */}
            <View>
              <Text className="text-gray-800 text-base font-inter-medium mb-2">
                Электронная почта
              </Text>

              <Controller
                name="email"
                control={loginForm.control}
                rules={{
                  required: 'Это поле обязательно',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Введите корректный email адрес',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border ${
                      loginForm.formState.errors.email ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <MaterialCommunityIcons name="email-variant" size={20} color={'#9CA3AF'} />

                    <TextInput
                      className="flex-1 ml-3.5 text-gray-800 font-inter"
                      placeholder="example@inbox.ru"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      editable={!loginMutation.isPending}
                    />
                  </View>
                )}
              />

              {/* Ошибки валидации */}
              {loginForm.formState.errors.email && (
                <Text className="text-red-500 text-sm mt-1 font-inter">
                  {loginForm.formState.errors.email.message}
                </Text>
              )}
            </View>

            {/* Пароль */}
            <View>
              <Text className="text-gray-800 text-base font-inter-medium mb-2">Пароль</Text>

              <Controller
                name="password"
                control={loginForm.control}
                rules={{
                  required: 'Это поле обязательно',
                  minLength: {
                    value: 6,
                    message: 'Пароль должен быть не менее 6 символов',
                  },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                    message: 'Пароль должен содержать цифры и заглавные буквы',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border ${
                      loginForm.formState.errors.password ? 'border-red-500' : 'border-gray-200'
                    }`}
                  >
                    <MaterialCommunityIcons name="lock-outline" size={20} color={'#9CA3AF'} />

                    <TextInput
                      className="flex-1 ml-3.5 text-gray-800 font-inter"
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      editable={!loginMutation.isPending}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={loginMutation.isPending}
                    >
                      <MaterialCommunityIcons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={'#9CA3AF'}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {/* Ошибки валидации */}
              {loginForm.formState.errors.password && (
                <Text className="text-red-500 text-sm mt-1 font-inter">
                  {loginForm.formState.errors.password.message}
                </Text>
              )}
            </View>

            {/* Забыли пароль? */}
            <TouchableOpacity
              className="self-end -mt-2 mb-8"
              onPress={() => router.push('/screens/forgot-password')}
              disabled={loginMutation.isPending}
            >
              <Text className="text-blue-600 text-base font-inter-medium">Забыли пароль?</Text>
            </TouchableOpacity>
          </View>

          {/* Кнопка входа */}
          <TouchableOpacity
            className={`rounded-xl py-3.5 px-8  ${
              loginForm.formState.isValid && !loginMutation.isPending
                ? 'bg-blue-600'
                : 'bg-blue-400'
            }`}
            onPress={loginForm.handleSubmit(onLoginSubmit)}
            disabled={!loginForm.formState.isValid || loginMutation.isPending}
          >
            <Text className="text-white text-center text-lg font-inter-bold">
              {loginMutation.isPending ? 'Вход...' : 'Войти'}
            </Text>
          </TouchableOpacity>

          {/* Разделитель */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500 font-inter">Или другим способом</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Вход через сервисы */}
          <View className="space-y-4 mb-5">
            {/* YandexID */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl py-3.5 mb-3.5"
              disabled={loginMutation.isPending}
            >
              <Image
                source={require('@/assets/images/icons/yandex.png')}
                className="w-7 h-7 mr-2.5"
                resizeMode="contain"
              />
              <Text className="text-gray-700 font-inter-medium text-base">
                Войти через Яндекс ID
              </Text>
            </TouchableOpacity>

            {/* GoogleID */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl py-3.5"
              disabled={loginMutation.isPending}
            >
              <Image
                source={require('@/assets/images/icons/google.webp')}
                className="w-6 h-6 mr-3"
                resizeMode="contain"
              />
              <Text className="text-gray-700 font-inter-medium text-base">
                Войти через Google ID
              </Text>
            </TouchableOpacity>
          </View>

          {/* Ссылка на регистрацию */}
          <View className="flex-row justify-center">
            <Text className="text-gray-500 text-base font-inter">Ещё нет аккаунта? </Text>
            <TouchableOpacity
              onPress={handleSingUpNavigation}
              // disabled={loginMutation.isPending}
            >
              <Text className="text-blue-600 text-base font-inter-medium">Создать</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
