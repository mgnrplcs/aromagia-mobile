import SafeScreen from '@/components/SafeScreen';
import { useAddresses } from '@/hooks/useAddresses';
import useCart from '@/hooks/useCart';
import { useApi } from '@/lib/api';
import { formatPrice, getDeclension } from '@/lib/utils';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useState, useCallback } from 'react';
import { Address, Brand, Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import AddressSelectionModal from '@/components/modals/AddressSelectionModal';
import { router } from 'expo-router';

const CartScreen = () => {
  const api = useApi();
  const {
    cart,
    cartItemCount,
    clearCart,
    isError,
    isLoading,
    isRemoving,
    isUpdating,
    removeFromCart,
    updateQuantity,
    // Если refetch нет в хуке useCart, удали его или добавь в сам хук.
    // Пока я закомментирую, чтобы не ломалось, или использую заглушку:
    refetch = async () => {},
  } = useCart();

  const { addresses } = useAddresses();

  // Удаляем useStripe, так как библиотека удалена
  // const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const cartItems = cart?.items || [];

  // Расчеты (берем из cart.totalPrice или считаем сами)
  const subtotal = cart?.subtotal || 0;

  // Логика доставки
  const shippingThreshold = 5000;
  const shippingCost = subtotal > shippingThreshold ? 0 : 300;

  // Итого
  const total = cart?.totalPrice ? cart.totalPrice + shippingCost : 0;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleQuantityChange = (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return;
    updateQuantity({ productId, quantity: newQuantity });
  };

  const handleRemoveItem = (productId: string, productName: string) => {
    Alert.alert('Удаление', `Убрать "${productName}" из корзины?`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => removeFromCart(productId),
      },
    ]);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!addresses || addresses.length === 0) {
      Alert.alert(
        'Нет адреса',
        'Пожалуйста, добавьте адрес доставки в профиле перед оформлением.',
        [{ text: 'OK' }]
      );
      return;
    }

    setAddressModalVisible(true);
  };

  const handleProceedWithPayment = async (selectedAddress: Address) => {
    setAddressModalVisible(false);
    setPaymentLoading(true);

    // --- ИМИТАЦИЯ ОПЛАТЫ (БЕЗ STRIPE) ---
    console.log('Начало оформления заказа (DEMO MODE)...');

    try {
      // Здесь мы мапим данные из твоего типа Address в то, что ждет бекенд
      const shippingData = {
        fullName: selectedAddress.fullName,
        streetAddress: selectedAddress.streetAddress,
        city: selectedAddress.city,
        state: selectedAddress.region, // В типах у тебя region, а не state
        zipCode: selectedAddress.zipCode,
        phoneNumber: selectedAddress.phone, // В типах phone, а не phoneNumber
      };

      // Если хочешь реально создать заказ на беке (без оплаты), раскомментируй:
      /*
      await api.post('/payment/create-intent', {
         cartItems,
         shippingAddress: shippingData
      });
      */

      // Искусственная задержка 1.5 сек
      setTimeout(() => {
        setPaymentLoading(false);

        Alert.alert('Заказ принят!', 'В демо-режиме оплата отключена. Мы получили ваш заказ.', [
          { text: 'OK', onPress: () => clearCart() },
        ]);
      }, 1500);
    } catch (error) {
      console.error(error);
      Alert.alert('Ошибка', 'Не удалось оформить заказ');
      setPaymentLoading(false);
    }
  };

  // Хелпер для получения названия бренда
  const getBrandName = (product: Product) => {
    if (product.brand && typeof product.brand === 'object' && 'name' in product.brand) {
      return (product.brand as Brand).name;
    }
    return '';
  };

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI refetch={refetch} />;

  // Если корзина пуста
  if (!isLoading && cartItems.length === 0) return <EmptyUI />;

  return (
    <SafeScreen>
      {/* --- HEADER --- */}
      <View className="px-6 pt-6 pb-4 bg-white flex-row items-center justify-between border-b border-gray-50">
        <Text className="text-[#111827] text-3xl font-raleway-bold tracking-tight">Корзина</Text>
        <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <Text className="text-primary text-sm font-inter-bold">
            {cartItemCount} {getDeclension(cartItemCount, ['товар', 'товара', 'товаров'])}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-gray-50/50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180, paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#87e4ab']}
            tintColor="#87e4ab"
          />
        }
      >
        <View className="px-6 gap-4">
          {cartItems.map((item) => {
            // ⭐️ КЛЮЧЕВОЕ ИСПРАВЛЕНИЕ:
            // Приводим тип к Product, так как мы знаем, что в корзине лежит объект, а не строка ID
            const product = item.product as Product;

            return (
              <View
                key={item._id || product._id}
                className="bg-white rounded-3xl p-4 border border-gray-100 flex-row"
              >
                {/* Product Image */}
                <View className="relative">
                  <Image
                    source={product.images?.[0]} // Безопасный доступ
                    className="bg-gray-50 border border-gray-100"
                    contentFit="cover"
                    style={{ width: 100, height: 100, borderRadius: 16 }}
                  />
                </View>

                <View className="flex-1 ml-4 justify-between py-1">
                  <View>
                    <View className="flex-row justify-between items-start">
                      <Text className="text-[#9CA3AF] text-[11px] font-raleway-bold uppercase tracking-wider">
                        {getBrandName(product)}
                      </Text>

                      {/* Кнопка удалить */}
                      <TouchableOpacity
                        onPress={() => handleRemoveItem(product._id, product.name)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        disabled={isRemoving}
                      >
                        <Ionicons name="trash-outline" size={18} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <Text
                      className="text-[#111827] font-raleway-bold text-[15px] leading-5 mt-0.5 mb-1"
                      numberOfLines={2}
                    >
                      {product.name}
                    </Text>

                    {/* Спецификация парфюма */}
                    <Text className="text-[#6B7280] text-xs font-inter-medium mb-2">
                      {product.volume} мл • {product.concentration}
                    </Text>
                  </View>

                  {/* Цена и контроллеры */}
                  <View className="flex-row items-end justify-between mt-1">
                    <View>
                      <Text className="text-[#111827] font-inter-extrabold text-lg">
                        {formatPrice(product.price * item.quantity)}
                      </Text>
                      {item.quantity > 1 && (
                        <Text className="text-[#9CA3AF] text-[10px]">
                          {formatPrice(product.price)} / шт
                        </Text>
                      )}
                    </View>

                    <View className="flex-row items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                      <TouchableOpacity
                        className="w-7 h-7 items-center justify-center bg-white rounded-full shadow-sm"
                        activeOpacity={0.7}
                        onPress={() => handleQuantityChange(product._id, item.quantity, -1)}
                        disabled={isUpdating}
                      >
                        <Ionicons name="remove" size={14} color="#111827" />
                      </TouchableOpacity>

                      <View className="w-8 items-center">
                        {isUpdating ? (
                          <ActivityIndicator size="small" color="#111827" />
                        ) : (
                          <Text className="text-[#111827] font-inter-bold text-sm">
                            {item.quantity}
                          </Text>
                        )}
                      </View>

                      <TouchableOpacity
                        className="w-7 h-7 items-center justify-center bg-white rounded-full shadow-sm"
                        activeOpacity={0.7}
                        onPress={() => handleQuantityChange(product._id, item.quantity, 1)}
                        disabled={isUpdating}
                      >
                        <Ionicons name="add" size={14} color="#111827" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* --- ORDER SUMMARY --- */}
        <View className="mx-6 mt-6 p-5 bg-white rounded-3xl border border-gray-100 space-y-3">
          <Text className="font-raleway-bold text-lg text-[#111827] mb-1">Сводка заказа</Text>

          <View className="flex-row justify-between">
            <Text className="text-[#6B7280] font-inter-medium">Подытог</Text>
            <Text className="text-[#111827] font-inter-semibold">{formatPrice(subtotal)}</Text>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-[#6B7280] font-inter-medium">Доставка</Text>
            <Text
              className={
                shippingCost === 0
                  ? 'text-green-600 font-inter-bold'
                  : 'text-[#111827] font-inter-semibold'
              }
            >
              {shippingCost === 0 ? 'Бесплатно' : formatPrice(shippingCost)}
            </Text>
          </View>

          <View className="h-[1px] bg-gray-100 my-1" />

          <View className="flex-row justify-between items-center">
            <Text className="text-[#111827] font-raleway-bold text-lg">Итого</Text>
            <Text className="text-primary font-inter-extrabold text-xl">{formatPrice(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* --- FOOTER --- */}
      <View className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 pt-4 pb-8 px-6 shadow-lg shadow-black/5">
        <TouchableOpacity
          className="bg-[#111827] rounded-2xl overflow-hidden shadow-lg shadow-black/10 active:opacity-90"
          activeOpacity={0.9}
          onPress={handleCheckout}
          disabled={paymentLoading}
        >
          <View className="py-4 flex-row items-center justify-center">
            {paymentLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Text className="text-white font-inter-bold text-lg mr-2">Оформить заказ</Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
              </>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <AddressSelectionModal
        visible={addressModalVisible}
        onClose={() => setAddressModalVisible(false)}
        onProceed={handleProceedWithPayment}
        isProcessing={paymentLoading}
      />
    </SafeScreen>
  );
};

export default CartScreen;

// --- Subcomponents ---

function LoadingUI() {
  return (
    <View className="flex-1 bg-white items-center justify-center">
      <ActivityIndicator size="large" color="#111827" />
    </View>
  );
}

function ErrorUI({ refetch }: { refetch: () => void }) {
  return (
    <View className="flex-1 bg-white items-center justify-center px-6">
      <Ionicons name="cloud-offline-outline" size={64} color="#EF4444" />
      <Text className="text-[#111827] font-raleway-bold text-xl mt-4">Ошибка загрузки</Text>
      <Text className="text-[#6B7280] text-center mt-2 font-inter-medium">
        Не удалось загрузить корзину.
      </Text>
      <TouchableOpacity onPress={refetch} className="mt-6 bg-gray-100 px-6 py-3 rounded-full">
        <Text className="font-inter-bold text-[#111827]">Попробовать снова</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyUI() {
  return (
    <SafeScreen>
      <View className="px-6 pt-6 pb-4 bg-white flex-row items-center border-b border-gray-50">
        <Text className="text-[#111827] text-3xl font-raleway-bold tracking-tight">Корзина</Text>
      </View>
      <View className="flex-1 items-center justify-center px-6 bg-gray-50/50 -mt-20">
        <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6 shadow-sm border border-gray-100">
          <Ionicons name="bag-handle-outline" size={42} color="#9CA3AF" />
        </View>
        <Text className="text-[#111827] font-raleway-bold text-2xl text-center">
          В корзине пусто
        </Text>
        <Text className="text-[#6B7280] text-center mt-3 font-inter-light leading-6 px-8 text-[15px]">
          Вы еще не добавили ни одного аромата. Загляните в каталог, чтобы найти что-то особенное.
        </Text>
        <TouchableOpacity
          className="bg-[#111827] px-8 py-3.5 rounded-full flex-row items-center shadow-lg shadow-black/10 mt-8 active:opacity-90"
          activeOpacity={0.9}
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-white font-inter-semibold text-base">Перейти к покупкам</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}
