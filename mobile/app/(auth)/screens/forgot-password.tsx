import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const handleBackToLogin = () => {
    router.back();
  };

  const onForgotPasswordSubmit = (data: ForgotPasswordFormData) => {
    console.log('Forgot password data:', data);
    setIsSubmitted(true);
  };

  const handleResendEmail = () => {
    const email = forgotPasswordForm.getValues('email');
    if (email) {
      console.log('Resending password reset email to:', email);
    }
  };

  // --- Экран успешной отправки ---
  if (isSubmitted) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: 'center' }}>
          {/* Иконка */}
          <View className="items-center mb-6">
            <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="email-check-outline" size={40} color="#10B981" />
            </View>
          </View>

          <Text className="text-2xl font-inter-bold text-gray-900 mb-4 text-center">
            Проверьте вашу почту
          </Text>

          <Text className="text-center text-gray-500 text-base font-inter mb-8">
            Мы отправили инструкции по сбросу пароля {'\n'} на вашу электронную почту{' '}
            <Text className="font-inter-bold text-gray-800">
              {forgotPasswordForm.getValues('email')}
            </Text>
          </Text>

          {/* Инструкции */}
          <View className="bg-blue-50 rounded-xl p-5 mb-8">
            <Text className="text-blue-800 font-inter-bold text-sm mb-2">Что дальше?</Text>
            <View className="gap-2">
              <Text className="text-blue-700 font-inter text-sm leading-5">
                1. Найдите письмо с темой "Сброс пароля"
              </Text>
              <Text className="text-blue-700 font-inter text-sm leading-5">
                2. Если письма нет, проверьте папку "Спам"
              </Text>
              <Text className="text-blue-700 font-inter text-sm leading-5">
                3. Перейдите по ссылке в письме
              </Text>
            </View>
          </View>

          {/* Кнопка отправки повторно */}
          <TouchableOpacity
            className="bg-blue-600 rounded-xl py-4 mb-4"
            onPress={handleResendEmail}
          >
            <Text className="text-white text-center text-base font-inter-semibold">
              Отправить письмо повторно
            </Text>
          </TouchableOpacity>

          {/* Кнопка назад */}
          <TouchableOpacity
            className="border border-gray-200 rounded-xl py-4"
            onPress={handleBackToLogin}
          >
            <Text className="text-center text-gray-600 text-base font-inter-medium">
              Вернуться к входу
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

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
          <View className="mt-10 mb-8">
            <View className="flex-row items-center mb-6">
              <TouchableOpacity onPress={handleBackToLogin} className="p-2 -ml-2 mr-2">
                <MaterialCommunityIcons name="arrow-left" size={24} color="#1F2937" />
              </TouchableOpacity>
              <Text className="text-lg font-inter-medium text-gray-900">Забыли пароль?</Text>
            </View>

            <View>
              <Text className="text-3xl font-inter-bold text-gray-900 mb-3">
                Восстановление пароля
              </Text>
              <Text className="text-gray-400 text-base font-inter leading-6">
                Введите ваш адрес электронной почты, и мы отправим вам инструкции для сброса пароля
              </Text>
            </View>
          </View>

          <View className="gap-6">
            {/* Эл. почта */}
            <View>
              <Text className="text-gray-800 text-base font-inter-medium mb-2">
                Электронная почта
              </Text>

              <Controller
                name="email"
                control={forgotPasswordForm.control}
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
                      forgotPasswordForm.formState.errors.email
                        ? 'border-red-500'
                        : 'border-gray-200'
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
                    />
                  </View>
                )}
              />

              {/* Ошибки валидации */}
              {forgotPasswordForm.formState.errors.email && (
                <Text className="text-red-500 text-sm mt-1 font-inter">
                  {forgotPasswordForm.formState.errors.email.message}
                </Text>
              )}
            </View>

            {/* Кнопка отправки */}
            <TouchableOpacity
              className={`rounded-xl py-4 px-8 mt-3 ${
                forgotPasswordForm.formState.isValid ? 'bg-blue-600' : 'bg-blue-400'
              }`}
              onPress={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)}
              disabled={!forgotPasswordForm.formState.isValid}
            >
              <Text className="text-white text-center text-lg font-inter-bold">Отправить</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
