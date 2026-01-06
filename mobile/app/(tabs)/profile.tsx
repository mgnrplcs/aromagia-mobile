import SafeScreen from '@/components/SafeScreen';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { ScrollView, Text, TouchableOpacity, View, Switch } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';

// Список меню "Мой аккаунт"
const ACCOUNT_ITEMS = [
  {
    id: 1,
    icon: 'person',
    title: 'Личные данные',
    color: '#3B82F6',
    action: '/profile-edit',
  },
  {
    id: 2,
    icon: 'bag',
    title: 'Мои заказы',
    color: '#10B981',
    action: '/orders',
  },
  {
    id: 3,
    icon: 'map',
    title: 'Адреса доставки',
    color: '#F5CD0B',
    action: '/addresses',
  },
  {
    id: 4,
    icon: 'heart',
    title: 'Избранное',
    color: '#EF4444',
    action: '/(tabs)/wishlist',
  },
] as const;

const ProfileScreen = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleNavigation = (path: string) => {
    try {
      router.push(path as any);
    } catch (error) {
      console.error('Ошибка навигации:', error);
    }
  };

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1 bg-background-subtle"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
      >
        {/* --- Карточка профиля --- */}
        <View className="mx-6 bg-white rounded-3xl border mt-4 border-gray-100 mb-6">
          <View className="px-5 py-5 flex-row items-center">
            {/* Аватар */}
            <View className="mr-5 relative">
              {/* 4. Используем Image из expo-image */}
              {user?.imageUrl ? (
                <Image
                  source={user.imageUrl}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                  contentFit="cover" // Аналог resizeMode в expo-image
                  transition={500} // Плавное появление
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center">
                  <Ionicons name="person" size={30} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Текст */}
            <View className="flex-1">
              <Text className="text-[#111827] text-xl font-raleway-bold mb-0.5" numberOfLines={1}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text
                className="text-[#6B7280] text-sm font-inter-medium opacity-80"
                numberOfLines={1}
              >
                {user?.emailAddresses?.[0]?.emailAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* --- Мой аккаунт --- */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-3xl overflow-hidden border border-gray-100">
            {ACCOUNT_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                className={`flex-row items-center justify-between p-4 bg-white active:bg-gray-50 ${
                  index !== ACCOUNT_ITEMS.length - 1 ? 'border-b border-gray-100' : ''
                }`}
                activeOpacity={0.7}
                onPress={() => handleNavigation(item.action)}
              >
                <View className="flex-row items-center">
                  {/* Иконка */}
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: item.color }}
                  >
                    <Ionicons name={item.icon as any} size={18} color="#FFFFFF" />
                  </View>
                  <Text className="text-[#111827] font-inter-medium text-[15px]">{item.title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- Приложение --- */}
        <View className="px-6 mb-8">
          <View className="bg-white rounded-3xl overflow-hidden border border-gray-100">
            {/* Уведомления */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-[#8B5CF6] items-center justify-center mr-4">
                  <Ionicons name="notifications" size={18} color="#FFFFFF" />
                </View>
                <Text className="text-[#111827] font-inter-medium text-[15px]">Уведомления</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#E5E7EB', true: '#87e4ab' }}
                thumbColor={'#FFFFFF'}
              />
            </View>

            {/* Безопасность */}
            <TouchableOpacity
              className="flex-row items-center justify-between p-4 active:bg-gray-50"
              activeOpacity={0.7}
              onPress={() => router.push('/security')}
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-[#F97316] items-center justify-center mr-4">
                  <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                </View>
                <Text className="text-[#111827] font-inter-medium text-[15px]">Безопасность</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- БЛОК 4: ВЫХОД --- */}
        <View className="px-6 mb-3">
          <TouchableOpacity
            className="bg-white rounded-3xl py-4 flex-row items-center justify-center border border-gray-100 active:bg-red-50"
            activeOpacity={0.8}
            onPress={() => signOut()}
          >
            <View className="mr-2">
              <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            </View>
            <Text className="text-[#EF4444] font-inter-bold text-[15px]">Выйти из аккаунта</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-[#9CA3AF] text-xs font-inter mb-4">
          Версия приложения v1.0.0
        </Text>
      </ScrollView>
    </SafeScreen>
  );
};

export default ProfileScreen;
