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

interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegistrationScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const registerForm = useForm<RegisterFormData>({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = { isPending: false };

  const handleSingInNavigation = () => {
    router.push('/screens/login');
  };

  const onRegisterSubmit = (data: RegisterFormData) => {
    console.log('Данные для регистрации:', data);
    // TODO: Вызвать мутацию
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
          <View className="mt-12 mb-4 flex-row items-center">
            <Image
              source={require('@/assets/images/icons/aromagia_sm.png')}
              className="w-14 h-14 mr-3"
              resizeMode="contain"
            />
            <View className="flex-1">
              <Text className="text-3xl font-inter-bold text-gray-900 mb-1">Создание аккаунта</Text>
              <Text className="text-gray-400 text-base font-inter">
                Заполните поля и начните исследовать
              </Text>
            </View>
          </View>

          <View className="gap-4 mt-4">
            {/* Имя */}
            <View>
              <Text className="text-gray-800 text-base font-inter-medium mb-2">Имя</Text>
              <Controller
                name="firstName"
                control={registerForm.control}
                rules={{ required: 'Имя обязательно' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border ${registerForm.formState.errors.firstName ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <MaterialCommunityIcons name="account-outline" size={21} color={'#9CA3AF'} />
                    <TextInput
                      className="flex-1 ml-3.5 text-gray-800 font-inter"
                      placeholder="Иван"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      autoCapitalize="words"
                      editable={!registerMutation.isPending}
                    />
                  </View>
                )}
              />
              {registerForm.formState.errors.firstName && (
                <Text className="text-red-500 text-sm mt-1 font-inter">
                  {registerForm.formState.errors.firstName.message}
                </Text>
              )}
            </View>

            {/* Фамилия */}
            <View>
              <Text className="text-gray-800 text-base font-inter-medium mb-2">Фамилия</Text>
              <Controller
                name="lastName"
                control={registerForm.control}
                rules={{ required: 'Фамилия обязательна' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border ${registerForm.formState.errors.lastName ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <MaterialCommunityIcons name="account-outline" size={21} color={'#9CA3AF'} />
                    <TextInput
                      className="flex-1 ml-3.5 text-gray-800 font-inter"
                      placeholder="Иванов"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      autoCapitalize="words"
                      editable={!registerMutation.isPending}
                    />
                  </View>
                )}
              />
              {registerForm.formState.errors.lastName && (
                <Text className="text-red-500 text-sm mt-1 font-inter">
                  {registerForm.formState.errors.lastName.message}
                </Text>
              )}
            </View>

            {/* Эл. почта */}
            <View>
              <Text className="text-gray-800 text-base font-inter-medium mb-2">
                Электронная почта
              </Text>
              <Controller
                name="email"
                control={registerForm.control}
                rules={{
                  required: 'Это поле обязательно',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Введите корректный email адрес',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border ${registerForm.formState.errors.email ? 'border-red-500' : 'border-gray-200'}`}
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
                      editable={!registerMutation.isPending}
                    />
                  </View>
                )}
              />
              {registerForm.formState.errors.email && (
                <Text className="text-red-500 text-sm mt-1 font-inter">
                  {registerForm.formState.errors.email.message}
                </Text>
              )}
            </View>

            {/* Пароль */}
            <View>
              <Text className="text-gray-800 text-base font-inter-medium mb-2">Пароль</Text>
              <Controller
                name="password"
                control={registerForm.control}
                rules={{
                  required: 'Пароль обязателен',
                  minLength: { value: 8, message: 'Пароль должен быть не менее 8 символов' },
                  pattern: {
                    value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                    message: 'Пароль должен содержать цифры, строчные и заглавные буквы',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border ${registerForm.formState.errors.password ? 'border-red-500' : 'border-gray-200'}`}
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
                      editable={!registerMutation.isPending}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      disabled={registerMutation.isPending}
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
              {registerForm.formState.errors.password && (
                <Text className="text-red-500 text-sm mt-1 font-inter">
                  {registerForm.formState.errors.password.message}
                </Text>
              )}
            </View>

            {/* Подтверждение пароля */}
            <View>
              <Text className="text-gray-800 text-base font-inter-medium mb-2">
                Подтвердите пароль
              </Text>
              <Controller
                name="confirmPassword"
                control={registerForm.control}
                rules={{
                  required: 'Подтвердите ваш пароль',
                  validate: (value) =>
                    value === registerForm.getValues('password') || 'Пароли не совпадают',
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <View
                    className={`flex-row items-center bg-gray-50 rounded-xl px-4 py-4 border ${registerForm.formState.errors.confirmPassword ? 'border-red-500' : 'border-gray-200'}`}
                  >
                    <MaterialCommunityIcons name="lock-check-outline" size={20} color={'#9CA3AF'} />
                    <TextInput
                      className="flex-1 ml-3.5 text-gray-800 font-inter"
                      placeholder="••••••••"
                      placeholderTextColor="#9CA3AF"
                      value={value}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      secureTextEntry={!showConfirmPassword}
                      editable={!registerMutation.isPending}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={registerMutation.isPending}
                    >
                      <MaterialCommunityIcons
                        name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={'#9CA3AF'}
                      />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {registerForm.formState.errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1 font-inter">
                  {registerForm.formState.errors.confirmPassword.message}
                </Text>
              )}
            </View>
          </View>

          {/* Кнопка регистрации */}
          <TouchableOpacity
            className={`rounded-xl py-4 px-8 mt-8 ${
              registerForm.formState.isValid && !registerMutation.isPending
                ? 'bg-blue-600'
                : 'bg-blue-400'
            }`}
            onPress={registerForm.handleSubmit(onRegisterSubmit)}
            disabled={!registerForm.formState.isValid || registerMutation.isPending}
          >
            <Text className="text-white text-center text-lg font-inter-bold">
              {registerMutation.isPending ? 'Регистрация...' : 'Зарегистрироваться'}
            </Text>
          </TouchableOpacity>

          {/* Разделитель */}
          <View className="flex-row items-center my-6">
            <View className="flex-1 h-px bg-gray-200" />
            <Text className="mx-4 text-gray-500 font-inter">Или другим способом</Text>
            <View className="flex-1 h-px bg-gray-200" />
          </View>

          {/* Вход через сервисы */}
          <View className="space-y-4 mb-6">
            {/* YandexID */}
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white border border-gray-200 rounded-xl py-3.5 mb-3.5"
              disabled={registerMutation.isPending}
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
              disabled={registerMutation.isPending}
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

          {/* Ссылка на вход */}
          <View className="flex-row justify-center mb-10">
            <Text className="text-gray-500 text-base font-inter">Уже есть аккаунт? </Text>
            <TouchableOpacity onPress={handleSingInNavigation}>
              <Text className="text-blue-600 text-base font-inter-medium">Войти</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
