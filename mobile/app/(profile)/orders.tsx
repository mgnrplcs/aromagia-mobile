import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// Хуки и компоненты
import { useOrders } from '@/hooks/useOrders';
import { useReviews } from '@/hooks/useReviews';
import SafeScreen from '@/components/SafeScreen';
import PageLoader from '@/components/PageLoader';
import ErrorState from '@/components/ErrorState';
import RatingModal from '@/components/modals/RatingModal';

// Утилиты и типы
import { formatDate, formatPrice, getDeclension } from '@/lib/utils';
import { Order, Product } from '@/types';

interface OrderWithReview extends Order {
  hasReviewed?: boolean;
}

export default function OrdersScreen() {
  const { data: orders, isLoading, isError, refetch } = useOrders();
  const { createReviewAsync, isCreatingReview } = useReviews();

  const [refreshing, setRefreshing] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithReview | null>(null);
  const [productRatings, setProductRatings] = useState<{ [key: string]: number }>({});
  const [productComments, setProductComments] = useState<{ [key: string]: string }>({});

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // --- ЛОГИКА ОТЗЫВОВ ---
  const handleOpenRating = (order: OrderWithReview) => {
    setSelectedOrder(order);
    setShowRatingModal(true);

    // Инициализируем рейтинги нулями
    const initialRatings: { [key: string]: number } = {};
    const initialComments: { [key: string]: string } = {};
    order.orderItems.forEach((item) => {
      // Приводим тип, так как в OrderItem product может быть string | Product
      const product = item.product as Product;
      if (product && product._id) {
        initialRatings[product._id] = 0;
        initialComments[product._id] = '';
      }
    });
    setProductRatings(initialRatings);
    setProductComments(initialComments);
  };

  const handleSubmitRating = async () => {
    if (!selectedOrder) return;

    // Проверяем, все ли товары оценены
    const allRated = Object.values(productRatings).every((rating) => rating > 0);
    if (!allRated) {
      Alert.alert('Внимание', 'Пожалуйста, оцените все товары в заказе');
      return;
    }

    try {
      await Promise.all(
        selectedOrder.orderItems.map((item) => {
          const product = item.product as Product;
          return createReviewAsync({
            productId: product._id,
            orderId: selectedOrder._id,
            rating: productRatings[product._id],
            comment: productComments[product._id] || '',
          });
        })
      );

      Alert.alert('Спасибо!', 'Ваш отзыв успешно отправлен');
      setShowRatingModal(false);
      setSelectedOrder(null);
      setProductRatings({});
      refetch();
    } catch (error: any) {
      Alert.alert('Ошибка', error?.response?.data?.error || 'Не удалось отправить отзыв');
    }
  };

  // --- ХЕЛПЕРЫ ДЛЯ СТАТУСОВ ---
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'В ожидании':
        return { bg: 'bg-yellow-50', text: 'text-yellow-600', label: 'В обработке' };
      case 'Отправлен':
        return { bg: 'bg-blue-50', text: 'text-blue-600', label: 'Отправлен' };
      case 'Доставлен':
        return { bg: 'bg-green-50', text: 'text-green-600', label: 'Доставлен' };
      default:
        return { bg: 'bg-gray-50', text: 'text-gray-500', label: status };
    }
  };

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <SafeScreen>
        <ErrorState
          title="Ошибка"
          description="Не удалось загрузить историю заказов"
          onRetry={refetch}
          showBackButton={true}
        />
      </SafeScreen>
    );
  }

  const ordersList = (orders as OrderWithReview[]) || [];

  return (
    <SafeScreen>
      {/* Хедер */}
      <View className="px-6 pt-4 pb-4 bg-white flex-row items-center border-b border-gray-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4 active:bg-gray-100"
        >
          <Ionicons name="arrow-back" size={20} color="#111827" />
        </TouchableOpacity>
        <Text className="text-black text-2xl font-raleway-bold tracking-tight">Мои заказы</Text>
      </View>

      <ScrollView
        className="flex-1 bg-gray-50/50"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111827" />
        }
      >
        {ordersList.length === 0 ? (
          // ПУСТОЕ СОСТОЯНИЕ
          <View className="flex-1 items-center justify-center px-6 mt-48">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={42} color="#8B5CF6" />
            </View>
            <Text className="text-black font-raleway-bold text-2xl text-center">
              История заказов пуста
            </Text>
            <Text className="text-[#6B7280] text-center mt-2.5 font-inter-light leading-7 px-8 text-[15px]">
              Вы еще не совершали покупок. Самое время выбрать свой первый аромат!
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 px-8 py-2.5 rounded-full flex-row items-center active:bg-gray-50 mt-4"
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)')}
            >
              <Text className="text-black font-inter-semibold text-base">В каталог</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // СПИСОК ЗАКАЗОВ
          <View className="px-6 gap-5">
            {ordersList.map((order) => {
              const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
              const firstItemProduct = order.orderItems[0]?.product as Product;
              const firstImage = firstItemProduct?.images?.[0] || null;
              const statusStyle = getStatusStyle(order.status);

              return (
                <View
                  key={order._id}
                  className="bg-white rounded-[24px] p-5 border border-gray-100 shadow-sm shadow-gray-100"
                >
                  {/* Верхняя часть карточки */}
                  <View className="flex-row mb-4">
                    {/* Изображение */}
                    <View className="relative">
                      <View className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden w-20 h-20">
                        {firstImage ? (
                          <Image
                            source={firstImage}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                          />
                        ) : (
                          <View className="flex-1 items-center justify-center">
                            <Ionicons name="image-outline" size={24} color="#D1D5DB" />
                          </View>
                        )}
                      </View>

                      {/* Бейдж количества товаров (если больше 1 типа) */}
                      {order.orderItems.length > 1 && (
                        <View className="absolute -bottom-2 -right-2 bg-black rounded-full w-7 h-7 items-center justify-center border-2 border-white">
                          <Text className="text-white text-[10px] font-inter-bold">
                            +{order.orderItems.length - 1}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Информация справа */}
                    <View className="flex-1 ml-4 justify-between py-0.5">
                      <View className="flex-row justify-between items-start">
                        <View>
                          <Text className="text-black font-raleway-bold text-[15px] mb-1">
                            Заказ №{order._id.slice(-6).toUpperCase()}
                          </Text>
                          <Text className="text-gray-400 font-inter-medium text-xs">
                            {formatDate(order.createdAt)}
                          </Text>
                        </View>

                        {/* Статус */}
                        <View className={`px-2.5 py-1 rounded-full ${statusStyle.bg}`}>
                          <Text
                            className={`${statusStyle.text} text-[10px] font-inter-bold uppercase tracking-wide`}
                          >
                            {statusStyle.label}
                          </Text>
                        </View>
                      </View>

                      {/* Цена и количество */}
                      <View className="flex-row items-center mt-2">
                        <Text className="text-black font-inter-bold text-lg">
                          {formatPrice(order.totalPrice)}
                        </Text>
                        <View className="w-1 h-1 bg-gray-300 rounded-full mx-2" />
                        <Text className="text-gray-500 font-inter-medium text-sm">
                          {totalItems} {getDeclension(totalItems, ['товар', 'товара', 'товаров'])}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Список товаров (текстом) */}
                  <View className="bg-gray-50 rounded-xl p-3 mb-4">
                    {order.orderItems.map((item) => {
                      const p = item.product as Product;
                      return (
                        <View
                          key={item._id}
                          className="flex-row justify-between items-center mb-1 last:mb-0"
                        >
                          <Text
                            className="text-gray-600 font-inter-medium text-[13px] flex-1 mr-2"
                            numberOfLines={1}
                          >
                            {p.name}
                          </Text>
                          <Text className="text-black font-inter-semibold text-[13px]">
                            x{item.quantity}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  {/* Кнопка действия (Оценить) */}
                  {order.status === 'Доставлен' && (
                    <View className="border-t border-gray-100 pt-3">
                      {order.hasReviewed ? (
                        <View className="flex-row items-center justify-center py-2 bg-green-50 rounded-xl border border-green-100">
                          <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                          <Text className="text-green-700 font-inter-semibold text-sm ml-2">
                            Отзыв оставлен
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          className="flex-row items-center justify-center py-3 bg-black rounded-xl active:opacity-90 shadow-sm"
                          activeOpacity={0.8}
                          onPress={() => handleOpenRating(order)}
                        >
                          <Ionicons name="star" size={16} color="#FFFFFF" />
                          <Text className="text-white font-inter-semibold text-sm ml-2 tracking-wide">
                            Оценить покупку
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Модалка рейтинга */}
      <RatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        order={selectedOrder}
        // Звезды
        productRatings={productRatings}
        onRatingChange={(productId, rating) =>
          setProductRatings((prev) => ({ ...prev, [productId]: rating }))
        }
        // Комментарии (НОВОЕ)
        productComments={productComments}
        onCommentChange={(productId, text) =>
          setProductComments((prev) => ({ ...prev, [productId]: text }))
        }
        onSubmit={handleSubmitRating}
        isSubmitting={isCreatingReview}
      />
    </SafeScreen>
  );
}
