import SafeScreen from '@/components/SafeScreen';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Pressable,
  Easing,
} from 'react-native';

// === 1. КРАСИВЫЙ СВИТЧ (Встроенный компонент) ===
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

  // Интерполяция цвета фона
  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', '#3B82F6'], // Серый -> Синий
  });

  // Интерполяция позиции кружка
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

// === 2. ОСНОВНОЙ ЭКРАН ===

type SecurityOption = {
  id: string;
  icon: string;
  title: string;
  description: string;
  type: 'navigation' | 'toggle';
  color: string;
  value?: boolean;
};

function PrivacyAndSecurityScreen() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [shareData, setShareData] = useState(false);

  const securitySettings: SecurityOption[] = [
    {
      id: 'password',
      icon: 'lock-closed',
      title: 'Сменить пароль',
      description: 'Обновите пароль от аккаунта',
      type: 'navigation',
      color: '#3B82F6', // Синий
    },
    {
      id: 'two-factor',
      icon: 'shield-checkmark',
      title: 'Двухфакторная аутентификация',
      description: 'Дополнительный уровень защиты',
      type: 'toggle',
      value: twoFactorEnabled,
      color: '#10B981', // Зеленый
    },
    {
      id: 'biometric',
      icon: 'finger-print',
      title: 'Вход по биометрии',
      description: 'Использовать Face или Touch ID',
      type: 'toggle',
      value: biometricEnabled,
      color: '#8B5CF6', // Фиолетовый
    },
  ];

  const privacySettings: SecurityOption[] = [
    {
      id: 'push',
      icon: 'notifications',
      title: 'Push-уведомления',
      description: 'Уведомления на телефон',
      type: 'toggle',
      value: pushNotifications,
      color: '#F59E0B', // Оранжевый/Желтый
    },
    {
      id: 'email',
      icon: 'mail',
      title: 'Email-рассылка',
      description: 'Статусы заказов на почту',
      type: 'toggle',
      value: emailNotifications,
      color: '#0EA5E9', // Голубой
    },
    {
      id: 'marketing',
      icon: 'megaphone',
      title: 'Маркетинговые предложения',
      description: 'Акции, скидки и новости',
      type: 'toggle',
      value: marketingEmails,
      color: '#EC4899', // Розовый
    },
    {
      id: 'data',
      icon: 'analytics',
      title: 'Делиться статистикой',
      description: 'Помогает нам улучшаться',
      type: 'toggle',
      value: shareData,
      color: '#6366F1', // Индиго
    },
  ];

  const accountSettings = [
    {
      id: 'activity',
      icon: 'time',
      title: 'Активность аккаунта',
      description: 'История недавних входов',
      color: '#F97316', // Оранжевый
    },
    {
      id: 'devices',
      icon: 'phone-portrait',
      title: 'Подключенные устройства',
      description: 'Управление активными сессиями',
      color: '#14B8A6', // Тил (Бирюзовый)
    },
    {
      id: 'data-download',
      icon: 'download',
      title: 'Скачать свои данные',
      description: 'Запросить архив с информацией',
      color: '#64748B', // Серый/Синий
    },
  ];

  const handleToggle = (id: string, value: boolean) => {
    switch (id) {
      case 'two-factor':
        setTwoFactorEnabled(value);
        break;
      case 'biometric':
        setBiometricEnabled(value);
        break;
      case 'push':
        setPushNotifications(value);
        break;
      case 'email':
        setEmailNotifications(value);
        break;
      case 'marketing':
        setMarketingEmails(value);
        break;
      case 'data':
        setShareData(value);
        break;
    }
  };

  const renderItem = (item: SecurityOption | (typeof accountSettings)[0]) => {
    const isToggle = 'type' in item && item.type === 'toggle';
    const isNavigation = !isToggle;

    return (
      <TouchableOpacity
        key={item.id}
        className="bg-white rounded-3xl p-4 mb-3 border border-gray-100 flex-row items-center"
        activeOpacity={isToggle ? 1 : 0.7}
        onPress={() => isNavigation && console.log('Navigate to', item.id)}
      >
        <View
          className="w-10 h-10 rounded-xl items-center justify-center mr-4 shadow-sm shadow-gray-200"
          style={{ backgroundColor: item.color }}
        >
          <Ionicons name={item.icon as any} size={20} color="#FFFFFF" />
        </View>

        {/* Текст */}
        <View className="flex-1 mr-2">
          <Text className="text-[#111827] font-inter-semibold text-[15px] mb-0.5">
            {item.title}
          </Text>
          <Text className="text-[#6B7280] font-inter text-sm leading-4">{item.description}</Text>
        </View>

        {/* Действие */}
        {isToggle ? (
          <BeautifulSwitch
            value={(item as SecurityOption).value ?? false}
            onValueChange={(value) => handleToggle(item.id, value)}
          />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeScreen>
      <View className="px-6 pt-4 pb-3 bg-white flex-row items-center border-b border-gray-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center -ml-2 mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-[#111827] text-xl font-raleway-bold">Безопасность</Text>
      </View>

      <ScrollView
        className="flex-1 bg-background-subtle"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 80, paddingTop: 20 }}
      >
        {/* Секция: БЕЗОПАСНОСТЬ */}
        <View className="px-6 mb-2">
          <Text className="text-[#111827] text-lg font-raleway-bold mb-2">Защита</Text>
          {securitySettings.map(renderItem)}
        </View>

        {/* Секция: ПРИВАТНОСТЬ */}
        <View className="px-6 mb-2">
          <Text className="text-[#111827] text-lg font-raleway-bold mb-2">Конфиденциальность</Text>
          {privacySettings.map(renderItem)}
        </View>

        {/* Секция: АККАУНТ */}
        <View className="px-6 mb-2">
          <Text className="text-[#111827] text-lg font-raleway-bold mb-2">Аккаунт</Text>
          {accountSettings.map(renderItem)}
        </View>

        {/* Кнопка: УДАЛИТЬ АККАУНТ */}
        <View className="px-6 pt-2 mb-4">
          <TouchableOpacity
            className="bg-white rounded-3xl p-4 flex-row items-center justify-between border border-red-100 active:bg-red-50"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center flex-1">
              <View className="w-10 h-10 rounded-xl bg-[#EF4444] items-center justify-center mr-4 shadow-sm shadow-red-200">
                <Ionicons name="ban" size={20} color="#FFFFFF" />
              </View>
              <View className="flex-1">
                <Text className="text-[#EF4444] font-inter-semibold text-[15px] mb-0.5">
                  Удалить аккаунт
                </Text>
                <Text className="text-[#9CA3AF] font-inter-medium text-xs">
                  Безвозвратное удаление профиля
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#EF4444" opacity={0.5} />
          </TouchableOpacity>
        </View>

        {/* ИНФО БЛОК */}
        <View className="px-6 pb-8">
          <View className="bg-primary/10 rounded-[24px] p-5 border border-primary/20">
            <View className="flex-row">
              <View className="w-12 h-12 rounded-full bg-white/60 items-center justify-center mr-4 shadow-sm shadow-primary/10">
                <Ionicons name="shield-checkmark" size={24} color="#5dbb82" />
              </View>

              <View className="flex-1 justify-center">
                <Text className="text-[#111827] font-raleway-semibold text-[15px] mb-1.5">
                  Ваши данные под защитой
                </Text>
                <Text className="text-[#6B7280] text-sm font-inter leading-5">
                  Все персональные данные хранятся в зашифрованном виде. Вы полностью контролируете
                  настройки доступа.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeScreen>
  );
}

export default PrivacyAndSecurityScreen;
