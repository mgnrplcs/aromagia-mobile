import SafeScreen from '@/components/SafeScreen';
import { useAuth, useUser } from '@clerk/clerk-expo';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert,
  Animated,
  Pressable,
  Easing,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback, useEffect, useRef } from 'react';
import { router } from 'expo-router';

import PageLoader from '@/components/PageLoader';
import ErrorState from '@/components/ErrorState';
import { useAddresses } from '@/hooks/useAddresses';
import { useOrders } from '@/hooks/useOrders';
import { useReturns } from '@/hooks/useReturns';
import { useCoupons } from '@/hooks/useCoupons';
import useWishlist from '@/hooks/useWishlist';

// === 1. Кастомный свич ===
interface BeautifulSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const BeautifulSwitch = ({ value, onValueChange }: BeautifulSwitchProps) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 250,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [value]);

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#3B82F6'],
  });

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 26],
  });

  return (
    <Pressable onPress={() => onValueChange(!value)}>
      <Animated.View
        style={{
          width: 50,
          height: 25,
          borderRadius: 15,
          backgroundColor,
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: 21,
            height: 21,
            borderRadius: 13,
            backgroundColor: 'white',
            transform: [{ translateX }],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2.5,
            elevation: 4,
          }}
        />
      </Animated.View>
    </Pressable>
  );
};

// --- Список меню ---
const ACCOUNT_ITEMS = [
  { id: 2, icon: 'bag', title: 'Мои заказы', color: '#10B981', action: '/orders' },
  { id: 6, icon: 'bag-remove', title: 'Мои возвраты', color: '#06B6D4', action: '/returns' },
  { id: 3, icon: 'map', title: 'Адреса доставки', color: '#F5CD0B', action: '/addresses' },
  { id: 4, icon: 'heart', title: 'Избранное', color: '#EF4444', action: '/(tabs)/wishlist' },
] as const;

const ProfileScreen = () => {
  const { signOut } = useAuth();

  const { user, isLoaded } = useUser();

  const { addresses } = useAddresses();
  const { data: orders } = useOrders();
  const { returns } = useReturns();
  const { data: coupons } = useCoupons();
  const { wishlistCount } = useWishlist();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [imageError, setImageError] = useState(false);

  const allowedCodes = ['WELCOME500', 'VIP_CLIENT'];
  const availableCouponsCount = (coupons || []).filter((c) =>
    allowedCodes.includes(c.code.toUpperCase())
  ).length;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await user?.reload();
    setImageError(false);
    setRefreshing(false);
  }, [user]);

  const handleNavigation = (path: string) => {
    if (path === '/addresses' && (!addresses || addresses.length === 0)) {
      Alert.alert('Нет адресов', 'Пожалуйста, добавьте адрес, чтобы продолжить.', [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Добавить адрес', onPress: () => router.push(path as any) },
      ]);
      return;
    }
    router.push(path as any);
  };

  if (!isLoaded) return <PageLoader />;

  if (!user) {
    return (
      <SafeScreen>
        <ErrorState
          title="Ошибка профиля"
          description="Не удалось загрузить данные профиля."
          onRetry={onRefresh}
          showBackButton={true}
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#111827']}
            tintColor="#111827"
            progressViewOffset={25}
          />
        }
      >
        {/* --- Карточка профиля --- */}
        <View className="mx-6 bg-white rounded-3xl p-5 border border-gray-100 mb-6 shadow-sm">
          <View className="flex-row items-center">
            <View className="mr-4 relative">
              {user.imageUrl && !imageError ? (
                <Image
                  source={user.imageUrl}
                  style={{ width: 64, height: 64, borderRadius: 32 }}
                  contentFit="cover"
                  transition={500}
                  onError={() => setImageError(true)}
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center border border-gray-200">
                  <Text className="text-xl tracking-wide font-raleway-bold text-gray-400">
                    {user.firstName ? (
                      user.firstName[0].toUpperCase()
                    ) : (
                      <Ionicons name="person" size={30} color="#9CA3AF" />
                    )}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-1">
              <Text className="text-[#111827] text-xl font-raleway-semibold" numberOfLines={1}>
                {user.firstName} {user.lastName}
              </Text>
              <Text className="text-[#6B7280] text-[14px] font-inter opacity-80" numberOfLines={1}>
                {user.emailAddresses?.[0]?.emailAddress}
              </Text>
            </View>
          </View>
        </View>

        {/* --- Промокоды --- */}
        <View className="px-6 mb-5">
          <TouchableOpacity
            className="bg-white rounded-3xl p-4 flex-row items-center justify-between border border-gray-100 shadow-sm active:bg-gray-50"
            activeOpacity={0.7}
            onPress={() => handleNavigation('/coupons')}
          >
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-xl bg-[#8B5CF6] items-center justify-center mr-4">
                <Ionicons name="ticket" size={18} color="#FFFFFF" />
              </View>
              <Text className="text-black tracking-wide font-inter text-[15px]">
                Промокоды {availableCouponsCount > 0 ? `(${availableCouponsCount})` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        {/* --- Основное Меню --- */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
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
                  <View
                    className="w-9 h-9 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: item.color }}
                  >
                    <Ionicons name={item.icon as any} size={18} color="#FFFFFF" />
                  </View>
                  <Text className="text-black tracking-wide font-inter text-[15px]">
                    {(() => {
                      let count = 0;
                      if (item.title === 'Мои заказы') count = orders?.length || 0;
                      if (item.title === 'Мои возвраты') count = returns?.length || 0;
                      if (item.title === 'Избранное') count = wishlistCount;

                      return count > 0 ? `${item.title} (${count})` : item.title;
                    })()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* --- Настройки --- */}
        <View className="px-6 mb-6">
          <View className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-[#8B5CF6] items-center justify-center mr-4">
                  <Ionicons
                    name={notificationsEnabled ? 'notifications' : 'notifications-off'}
                    size={18}
                    color="#FFFFFF"
                  />
                </View>
                <Text className="text-black font-inter tracking-wide text-[15px]">Уведомления</Text>
              </View>

              <BeautifulSwitch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
              />
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50"
              activeOpacity={0.7}
              onPress={() => router.push('/help')}
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-[#0EA5E9] items-center justify-center mr-4">
                  <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
                </View>
                <Text className="text-black font-inter tracking-wide text-[15px]">Помощь</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between p-4 active:bg-gray-50"
              activeOpacity={0.7}
              onPress={() => router.push('/security')}
            >
              <View className="flex-row items-center">
                <View className="w-9 h-9 rounded-xl bg-[#F97316] items-center justify-center mr-4">
                  <Ionicons name="shield-checkmark" size={18} color="#FFFFFF" />
                </View>
                <Text className="text-black font-inter tracking-wide text-[15px]">
                  Безопасность
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 mb-2.5">
          <TouchableOpacity
            className="bg-white rounded-2xl py-3 shadow-sm flex-row items-center justify-center border border-gray-100 active:bg-red-50"
            activeOpacity={0.8}
            onPress={() => signOut()}
          >
            <Text className="text-[#EF4444] font-inter-semibold tracking-wide text-base">
              Выйти из аккаунта
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-center text-[#9CA3AF] text-sm tracking-wide font-inter">
          Версия приложения v1.0.0
        </Text>
      </ScrollView>
    </SafeScreen>
  );
};

export default ProfileScreen;
