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
  TextInput,
  TouchableOpacity,
  View,
  RefreshControl,
  Keyboard,
} from 'react-native';
import { useState, useCallback } from 'react';
import { Address, Brand, Product } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import AddressSelectionModal from '@/components/modals/AddressSelectionModal';
import { router } from 'expo-router';
import { toast } from 'sonner-native';
import PageLoader from '@/components/PageLoader';
import ErrorState from '@/components/ErrorState';
import { useStripe } from '@stripe/stripe-react-native'; // <--- ИМПОРТ СТРАЙПА

// Импорт модалок
import RemoveItemModal from '@/components/modals/DeleteFromCartModal';
import ClearCartModal from '@/components/modals/ClearCartModal';

const ReceiptRow = ({
  label,
  value,
  isDiscount = false,
}: {
  label: string;
  value: string;
  isDiscount?: boolean;
}) => {
  return (
    <View className="flex-row items-end justify-between mb-2 w-full">
      <Text className="text-black font-inter-medium text-base tracking-wide z-10 bg-white pr-1">
        {label}
      </Text>
      <View className="flex-1 mx-1 overflow-hidden relative top-[3px]">
        <Text
          className="text-gray-300 font-inter-bold text-lg tracking-widest text-center"
          numberOfLines={1}
          ellipsizeMode="clip"
        >
          ....................................................................................................
        </Text>
      </View>
      <Text
        className={`${isDiscount ? 'text-blue-600' : 'text-black'} font-inter-semibold text-base tracking-wide z-10 bg-white pl-1`}
      >
        {value}
      </Text>
    </View>
  );
};

const CartScreen = () => {
  const api = useApi();
  const { initPaymentSheet, presentPaymentSheet } = useStripe(); // <--- ХУК СТРАЙПА
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
    refetch = async () => {},
  } = useCart();

  const { addresses } = useAddresses();

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [clearCartModalVisible, setClearCartModalVisible] = useState(false);

  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);

  const cartItems = cart?.items || [];

  // Calc
  const subtotal = cart?.subtotal || 0;
  const shippingThreshold = 5000;
  const shippingCost = subtotal > shippingThreshold ? 0 : 300;
  const totalBeforeDiscount = cart?.totalPrice ? cart.totalPrice + shippingCost : 0;
  const total = Math.max(0, totalBeforeDiscount - discount);

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

  const handleRemoveItem = (product: Product) => {
    setProductToDelete(product);
    setDeleteModalVisible(true);
  };

  const confirmRemoveItem = () => {
    if (productToDelete) {
      removeFromCart(productToDelete._id);
      setDeleteModalVisible(false);
      setProductToDelete(null);
    }
  };

  const handleClearAll = () => {
    setClearCartModalVisible(true);
  };

  const confirmClearAll = () => {
    clearCart();
    setDiscount(0);
    setPromoCode('');
    setClearCartModalVisible(false);
  };

  const handleApplyPromo = () => {
    if (!promoCode) return;
    Keyboard.dismiss();
    setIsApplyingPromo(true);

    setTimeout(() => {
      setIsApplyingPromo(false);
      if (promoCode.toUpperCase() === 'SALE2026') {
        const discountAmount = Math.floor(totalBeforeDiscount * 0.1);
        setDiscount(discountAmount);
      } else {
        setDiscount(0);
        toast.error('Промокод не найден');
      }
    }, 1000);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    if (!addresses || addresses.length === 0) {
      Alert.alert(
        'Нет адреса',
        'Пожалуйста, добавьте адрес доставки в профиле перед оформлением.',
        [
          { text: 'Отмена', style: 'cancel' },
          { text: 'Добавить', onPress: () => router.push('/(profile)/addresses') },
        ]
      );
      return;
    }

    setAddressModalVisible(true);
  };

  // --- ЛОГИКА ОПЛАТЫ ЧЕРЕЗ STRIPE ---
  const handleProceedWithPayment = async (selectedAddress: Address) => {
    setAddressModalVisible(false);
    setPaymentLoading(true);

    try {
      // 1. Создаем PaymentIntent на сервере
      // Бэкенд должен вернуть { clientSecret: string, ... }
      const { data } = await api.post('/payment/create-intent', {
        shippingAddress: selectedAddress,
      });

      if (!data.clientSecret) {
        toast.error('Ошибка сервера: нет ключа оплаты');
        setPaymentLoading(false);
        return;
      }

      // 2. Инициализируем шторку оплаты (Payment Sheet)
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: 'Aromagia',
        paymentIntentClientSecret: data.clientSecret,
        defaultBillingDetails: {
          name: selectedAddress.fullName,
          phone: selectedAddress.phone,
          address: {
            city: selectedAddress.city,
            country: 'RU', // Или код вашей страны
            line1: selectedAddress.streetAddress,
            postalCode: selectedAddress.zipCode,
          },
        },
        returnURL: 'aromagia://stripe-redirect', // Нужен для некоторых методов оплаты
      });

      if (initError) {
        console.error(initError);
        toast.error('Не удалось открыть оплату');
        setPaymentLoading(false);
        return;
      }

      // 3. Открываем шторку
      const { error: paymentError } = await presentPaymentSheet();

      if (paymentError) {
        if (paymentError.code === 'Canceled') {
        } else {
          toast.error(paymentError.message);
        }
        setPaymentLoading(false);
      } else {
        confirmClearAll();

        router.push('/(tabs)');
        toast.success('Заказ успешно оплачен!');
        setPaymentLoading(false);
      }
    } catch (error) {
      console.error(error);
      toast.error('Произошла ошибка при создании заказа');
      setPaymentLoading(false);
    }
  };

  const getBrandName = (product: Product) => {
    if (product.brand && typeof product.brand === 'object' && 'name' in product.brand) {
      return (product.brand as Brand).name;
    }
    return '';
  };

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <SafeScreen>
        <ErrorState
          title="Ошибка корзины"
          description="Не удалось загрузить содержимое корзины."
          onRetry={refetch}
          retryText="Попробовать снова"
        />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      {/* HEADER */}
      <View className="px-6 pt-6 pb-4 bg-white flex-row items-center justify-between border-b border-gray-50">
        <Text className="text-black text-3xl font-raleway-bold tracking-tight">Корзина</Text>
        <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
          <Text className="text-primary text-sm font-inter-semibold tracking-wide">
            {cartItemCount} {getDeclension(cartItemCount, ['товар', 'товара', 'товаров'])}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 bg-gray-50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 180, paddingTop: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3B82F6" />
        }
      >
        {cartItems.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 mt-48">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4 border border-gray-100">
              <Ionicons name="cart-outline" size={48} color="#3B82F6" />
            </View>
            <Text className="text-black font-raleway-bold text-2xl text-center">
              Ваша корзина пуста
            </Text>
            <Text className="text-[#6B7280] text-center mt-2.5 font-inter-light leading-7 px-8 text-[15px]">
              Выберите понравившийся товары и добавьте их сюда для оформления заказа
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 px-8 py-2.5 rounded-full flex-row items-center active:bg-gray-50 mt-4 shadow-sm"
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)')}
            >
              <Text className="text-[#111827] font-inter-semibold text-base">В каталог</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ТОВАРЫ */}
            <View className="px-6 gap-4">
              {cartItems.map((item) => {
                const product = item.product as Product;
                return (
                  <View
                    key={item._id || product._id}
                    className="bg-white rounded-3xl p-4 border border-gray-100 flex-row"
                  >
                    <View className="relative">
                      <Image
                        source={product.images?.[0]}
                        className="bg-gray-50 border border-gray-100"
                        contentFit="cover"
                        style={{ width: 100, height: 100, borderRadius: 16 }}
                      />
                    </View>

                    <View className="flex-1 ml-4 justify-between py-1">
                      <View>
                        <View className="flex-row justify-between items-start">
                          <Text className="text-black text-sm font-raleway-bold uppercase tracking-widest">
                            {getBrandName(product)}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleRemoveItem(product)}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            disabled={isRemoving}
                            className="bg-gray-50 p-1.5 rounded-full"
                          >
                            <Ionicons name="close" size={16} color="#9CA3AF" />
                          </TouchableOpacity>
                        </View>

                        <Text
                          className="text-black font-raleway-medium text-lg -mt-2.5 mb-1"
                          numberOfLines={1}
                        >
                          {product.name}
                        </Text>
                        <View className="bg-black self-start px-2 py-1 rounded-md mb-2.5 shadow-sm">
                          <Text className="text-white text-[9px] font-inter-extrabold tracking-wide">
                            {product.volume} МЛ
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-end justify-between">
                        <View>
                          <Text className="text-black font-inter-bold text-lg">
                            {formatPrice(product.price * item.quantity)}
                          </Text>

                          {item.quantity > 1 && (
                            <Text className="text-gray-500/75 text-sm font-inter">
                              {formatPrice(product.price)} / шт.
                            </Text>
                          )}
                        </View>

                        <View className="flex-row items-center bg-gray-50 rounded-full p-1 border border-gray-100">
                          <TouchableOpacity
                            className="w-7 h-7 items-center justify-center bg-white rounded-full shadow-sm"
                            onPress={() => handleQuantityChange(product._id, item.quantity, -1)}
                            disabled={isUpdating}
                          >
                            <Ionicons name="remove" size={14} color="#111827" />
                          </TouchableOpacity>

                          <View className="w-10 items-center">
                            {isUpdating ? (
                              <ActivityIndicator size="small" color="#111827" />
                            ) : (
                              <Text className="text-black font-inter-semibold text-sm">
                                {item.quantity}
                              </Text>
                            )}
                          </View>

                          <TouchableOpacity
                            className="w-7 h-7 items-center justify-center bg-white rounded-full shadow-sm"
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

            {/* СВОДКА */}
            <View className="mx-6 mt-5 mb-4">
              <View className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-sm z-10">
                {discount > 0 && (
                  <View className="mb-2">
                    <ReceiptRow label="Подытог" value={formatPrice(totalBeforeDiscount)} />
                    <ReceiptRow label="Скидка" value={`- ${formatPrice(discount)}`} isDiscount />
                    <View className="h-[1px] bg-gray-100 my-3" />
                  </View>
                )}

                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-black font-raleway-semibold tracking-wide text-lg">
                    Сумма к оплате
                  </Text>
                  <Text className="text-2xl font-inter-bold text-primary">
                    {formatPrice(total)}
                  </Text>
                </View>

                <View className="flex-row items-center gap-3">
                  <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center border border-gray-200/60">
                    <Ionicons name="ticket-outline" size={21} color="#9CA3AF" />
                  </View>
                  <View className="flex-1 flex-row items-center bg-gray-50 rounded-2xl border border-gray-200/60 pr-1 pl-3 h-12">
                    <TextInput
                      placeholder="SALE2026"
                      placeholderTextColor="#d1d1d1"
                      className="flex-1 h-full font-inter-semibold uppercase tracking-widest text-black text-[13px]"
                      value={promoCode}
                      onChangeText={setPromoCode}
                      autoCapitalize="characters"
                    />
                    {promoCode.length > 0 && (
                      <TouchableOpacity
                        onPress={handleApplyPromo}
                        disabled={isApplyingPromo}
                        className="bg-black px-3 py-1.5 rounded-lg mr-2"
                      >
                        <Text className="text-white text-xs font-inter-bold">ОК</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleClearAll}
                activeOpacity={0.7}
                className="mt-4 bg-white rounded-[20px] py-3 flex-row items-center justify-center border border-gray-100 shadow-sm"
              >
                <Ionicons
                  name="trash-outline"
                  size={17}
                  color="#b3b3b3"
                  style={{ marginRight: 8 }}
                />
                <Text className="text-black tracking-wide font-inter-medium text-base">
                  Очистить корзину
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>

      {/* FOOTER BUTTON */}
      {cartItems.length > 0 && (
        <View className="absolute bottom-28 left-0 right-0 px-6 z-50">
          <TouchableOpacity
            className="bg-blue-500 w-full rounded-2xl shadow-xl shadow-blue-500/30 active:scale-[0.98] transition-all"
            style={{ height: 50 }}
            activeOpacity={0.9}
            onPress={handleCheckout}
            disabled={paymentLoading}
          >
            <View className="flex-1 flex-row items-center justify-center">
              {paymentLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text className="text-white font-inter-bold text-lg mr-2.5">Оформить заказ</Text>
                  <View className="bg-white/20 p-1.5 rounded-full">
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* МОДАЛКИ */}
      <RemoveItemModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={confirmRemoveItem}
        product={productToDelete}
      />

      <ClearCartModal
        visible={clearCartModalVisible}
        onClose={() => setClearCartModalVisible(false)}
        onConfirm={confirmClearAll}
      />

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
