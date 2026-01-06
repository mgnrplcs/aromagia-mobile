import { View, Text } from 'react-native';
import React from 'react';
import SafeScreen from '@/components/SafeScreen';

const CartScreen = () => {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <Text className="text-text-primary font-raleway-bold text-xl">Корзина</Text>
        <Text className="text-text-secondary mt-2">В разработке...</Text>
      </View>
    </SafeScreen>
  );
};

export default CartScreen;
