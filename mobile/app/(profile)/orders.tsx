import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
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
import ReturnModal from '@/components/modals/ReturnModal';

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

  // Состояния для отзывов
  const [productRatings, setProductRatings] = useState<{ [key: string]: number }>({});
  const [productComments, setProductComments] = useState<{ [key: string]: string }>({});

  // Состояние для модалки возврата
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<OrderWithReview | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // --- ЛОГИКА ВОЗВРАТА ---
  const handleOpenReturn = (order: OrderWithReview) => {
    setSelectedReturnOrder(order);
    setShowReturnModal(true);
  };

  // --- ЛОГИКА ОТЗЫВОВ ---
  const handleOpenRating = (order: OrderWithReview) => {
    setSelectedOrder(order);
    setShowRatingModal(true);

    const initialRatings: { [key: string]: number } = {};
    const initialComments: { [key: string]: string } = {};
    order.orderItems.forEach((item) => {
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

  // --- СТИЛИ СТАТУСОВ (адаптировано под твой пример) ---
  const getStatusConfig = (status: string) => {
    // Используем opacity/10 для фона и opacity/20 для бордера
    switch (status) {
      case 'В ожидании':
        return {
          container: 'bg-amber-500/10 border-amber-500/20',
          text: 'text-amber-600',
          label: 'В обработке',
          icon: 'time-outline'
        };
      case 'Отправлен':
        return {
          container: 'bg-blue-500/10 border-blue-500/20',
          text: 'text-blue-600',
          label: 'Отправлен',
          icon: 'paper-plane-outline'
        };
      case 'Доставлен':
        return {
          container: 'bg-emerald-500/10 border-emerald-500/20',
          text: 'text-emerald-600',
          label: 'Доставлен',
          icon: 'checkmark-circle-outline'
        };
      case 'Отменен':
        return {
          container: 'bg-red-500/10 border-red-500/20',
          text: 'text-red-600',
          label: 'Отменен',
          icon: 'close-circle-outline'
        };
      default:
        return {
          container: 'bg-gray-500/10 border-gray-500/20',
          text: 'text-gray-600',
          label: status,
          icon: 'help-circle-outline'
        };
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
        className="flex-1 bg-[#F9FAFB]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111827" />
        }
      >
        {ordersList.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 mt-48">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="receipt-outline" size={42} color="#9CA3AF" />
            </View>
            <Text className="text-black font-raleway-bold text-2xl text-center">
              Заказов пока нет
            </Text>
            <Text className="text-gray-500 text-center mt-2 font-inter-medium px-8">
              Ваша история покупок появится здесь после оформления первого заказа.
            </Text>
            <TouchableOpacity
              className="bg-black px-8 py-3 rounded-2xl mt-6 active:opacity-80"
              onPress={() => router.push('/(tabs)')}
            >
              <Text className="text-white font-inter-semibold text-[15px]">Перейти в каталог</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-5 gap-5">
            {ordersList.map((order) => {
              const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
              const statusConfig = getStatusConfig(order.status);

              return (
                <View
                  key={order._id}
                  className="bg-white rounded-[24px] p-5 shadow-sm shadow-gray-200/60 border border-gray-100"
                >
                  {/* --- ВЕРХНИЙ БЛОК (БЕЗ КАРТИНКИ) --- */}
                  <View className="flex-row justify-between items-start mb-4">
                    {/* Левая часть: Номер и Дата */}
                    <View>
                      <Text className="text-black font-raleway-bold text-[18px] mb-1">
                        Заказ №{order._id.slice(-6).toUpperCase()}
                      </Text>
                      <Text className="text-gray-400 font-inter-medium text-[13px]">
                        от {formatDate(order.createdAt)}
                      </Text>
                    </View>

                    {/* Правая часть: Статус (Таблетка) */}
                    <View className={`px-3 py-1.5 rounded-full border flex-row items-center gap-1.5 ${statusConfig.container}`}>
                      <Ionicons name={statusConfig.icon as any} size={14} style={{ opacity: 0.8 }} color={statusConfig.text.replace('text-', '').replace('-600', '')} />
                      <Text className={`${statusConfig.text} text-[11px] font-inter-bold tracking-wide uppercase`}>
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  {/* Цена и кол-во товаров (Отдельная строка для акцента) */}
                  <View className="flex-row items-baseline mb-5">
                    <Text className="text-black font-inter-bold text-xl mr-2">
                      {formatPrice(order.totalPrice)}
                    </Text>
                    <Text className="text-gray-400 font-inter-medium text-sm">
                      за {totalItems} {getDeclension(totalItems, ['товар', 'товара', 'товаров'])}
                    </Text>
                  </View>

                  {/* --- СПИСОК ТОВАРОВ --- */}
                  <View className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100 mb-5">
                    {order.orderItems.map((item, idx) => {
                      const p = item.product as Product;
                      const brandName = item.brand || (p?.brand && typeof p.brand === 'object' ? (p.brand as any).name : '');
                      const itemImage = p?.images?.[0];
                      const isLast = idx === order.orderItems.length - 1;

                      return (
                        <View key={item._id}>
                          <View className="flex-row items-center py-2">
                            {/* Мини-изображение */}
                            <View className="w-10 h-10 bg-white rounded-lg border border-gray-100 overflow-hidden mr-3 items-center justify-center">
                              {itemImage ? (
                                <Image
                                  source={itemImage}
                                  style={{ width: '100%', height: '100%' }}
                                  contentFit="contain"
                                />
                              ) : (
                                <Ionicons name="cube-outline" size={16} color="#E5E7EB" />
                              )}
                            </View>

                            {/* Текст */}
                            <View className="flex-1 pr-2">
                              {brandName ? (
                                <Text className="text-gray-400 text-[10px] font-inter-bold uppercase tracking-wider mb-0.5">
                                  {brandName}
                                </Text>
                              ) : null}
                              <Text className="text-gray-800 font-inter-medium text-[13px] leading-4" numberOfLines={1}>
                                {item.name}
                              </Text>
                              {item.volume && (
                                <Text className="text-gray-400 text-[11px] font-inter-regular mt-0.5">
                                  {item.volume} мл
                                </Text>
                              )}
                            </View>

                            {/* Количество x Цена (опционально) или просто кол-во */}
                            <View className="items-end">
                              <Text className="text-black font-inter-semibold text-[13px]">
                                {item.quantity} шт.
                              </Text>
                            </View>
                          </View>

                          {/* Разделитель */}
                          {!isLast && <View className="h-[1px] bg-gray-200/50 ml-[52px]" />}
                        </View>
                      );
                    })}
                  </View>

                  {/* --- КНОПКИ ДЕЙСТВИЙ --- */}
                  {order.status === 'Доставлен' && (
                    <View className="flex-row gap-3">
                      {/* Кнопка возврата */}
                      <TouchableOpacity
                        className="flex-1 flex-row items-center justify-center py-3 bg-white border border-gray-200 rounded-xl active:bg-gray-50 shadow-sm shadow-gray-100"
                        activeOpacity={0.7}
                        onPress={() => handleOpenReturn(order)}
                      >
                        <Ionicons name="reload-outline" size={16} color="#374151" style={{ marginRight: 6 }} />
                        <Text className="text-gray-700 font-inter-semibold text-[13px]">
                          Возврат
                        </Text>
                      </TouchableOpacity>

                      {/* Кнопка оценки */}
                      {order.hasReviewed ? (
                        <View className="flex-[1.5] flex-row items-center justify-center py-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                          <Text className="text-emerald-700 font-inter-semibold text-[13px] ml-1.5">
                            Отзыв оставлен
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          className="flex-[1.5] flex-row items-center justify-center py-3 bg-black rounded-xl active:opacity-90 shadow-sm"
                          activeOpacity={0.8}
                          onPress={() => handleOpenRating(order)}
                        >
                          <Ionicons name="star" size={14} color="#FFFFFF" />
                          <Text className="text-white font-inter-semibold text-[13px] ml-2">
                            Оценить
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
        productRatings={productRatings}
        onRatingChange={(productId, rating) =>
          setProductRatings((prev) => ({ ...prev, [productId]: rating }))
        }
        productComments={productComments}
        onCommentChange={(productId, text) =>
          setProductComments((prev) => ({ ...prev, [productId]: text }))
        }
        onSubmit={handleSubmitRating}
        isSubmitting={isCreatingReview}
      />

      {/* Модалка возврата */}
      <ReturnModal
        visible={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        orderId={selectedReturnOrder?._id || null}
      />
    </SafeScreen>
  );
}