import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useOrders } from '@/hooks/useOrders';
import { useReviews } from '@/hooks/useReviews';
import SafeScreen from '@/components/SafeScreen';
import PageLoader from '@/components/PageLoader';
import ErrorState from '@/components/ErrorState';
import RatingModal from '@/components/modals/RatingModal';
import ReturnModal from '@/components/modals/ReturnModal';

import { formatDate, formatPrice, getDeclension } from '@/lib/utils';
import { Order, Product } from '@/types';

interface OrderWithReview extends Order {
  hasReviewed?: boolean;
  hasReturnRequested?: boolean;
}

export default function OrdersScreen() {
  const { data: orders, isLoading, isError, refetch } = useOrders();
  const { createReviewAsync, isCreatingReview } = useReviews();

  const [refreshing, setRefreshing] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithReview | null>(null);

  const [productRatings, setProductRatings] = useState<{ [key: string]: number }>({});
  const [productComments, setProductComments] = useState<{ [key: string]: string }>({});

  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<OrderWithReview | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // --- Логика возврата ---
  const handleOpenReturn = (order: OrderWithReview) => {
    setSelectedReturnOrder(order);
    setShowReturnModal(true);
  };

  // --- Логика отзывов ---
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

  // --- Стили статусов---
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'В ожидании':
        return {
          container: 'bg-amber-500/10 border-amber-500/20',
          text: 'text-amber-600',
          label: 'В обработке',
        };
      case 'Отправлен':
        return {
          container: 'bg-blue-500/10 border-blue-500/20',
          text: 'text-blue-600',
          label: 'Отправлен',
        };
      case 'Доставлен':
        return {
          container: 'bg-emerald-500/10 border-emerald-500/20',
          text: 'text-emerald-600',
          label: 'Доставлен',
        };
      case 'Отменен':
        return {
          container: 'bg-red-500/10 border-red-500/20',
          text: 'text-red-600',
          label: 'Отменен',
        };
      default:
        return {
          container: 'bg-gray-500/10 border-gray-500/20',
          text: 'text-gray-600',
          label: status,
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
      <View className="px-6 pt-2 pb-4 bg-white flex-row items-center justify-between border-b border-gray-50">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-full items-center justify-center mr-4 active:bg-gray-100"
          >
            <Ionicons name="arrow-back" size={20} color="#111827" />
          </TouchableOpacity>
          <Text className="text-black text-2xl font-raleway-semibold tracking-wide">
            Мои заказы
          </Text>
        </View>
        {ordersList.length > 0 && (
          <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Text className="text-primary text-sm font-inter-semibold tracking-wide">
              {ordersList.length} {getDeclension(ordersList.length, ['заказ', 'заказа', 'заказов'])}
            </Text>
          </View>
        )}
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
          <View className="px-5">
            {ordersList.map((order, index) => {
              const totalItems = order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
              const statusConfig = getStatusConfig(order.status);
              const marginBottom = index === ordersList.length - 1 ? 'mb-0' : 'mb-5';

              return (
                <View
                  key={order._id}
                  className={`bg-white rounded-[24px] p-5 shadow-sm shadow-gray-200/60 border border-gray-100 ${marginBottom}`}
                >
                  {/* --- Верхний блок --- */}
                  <View className="flex-row justify-between items-start mb-2">
                    <View>
                      <Text className="text-black font-inter-semibold text-xl">
                        Заказ №{order._id.slice(-6).toUpperCase()}
                      </Text>
                      <Text className="text-gray-400/90 font-inter text-sm">
                        от {formatDate(order.createdAt)}
                      </Text>
                    </View>

                    <View className={`px-3 py-1 rounded-lg ${statusConfig.container}`}>
                      <Text
                        className={`${statusConfig.text} text-[10px] font-inter-bold tracking-wider uppercase`}
                      >
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  {/* Цена и кол-во товаров */}
                  <View className="flex-row items-baseline mb-3">
                    <Text className="text-black font-inter-semibold text-xl mr-2">
                      {formatPrice(order.totalPrice)}
                    </Text>
                    <Text className="text-gray-400 font-inter text-sm">
                      за {totalItems} {getDeclension(totalItems, ['товар', 'товара', 'товаров'])}
                    </Text>
                  </View>

                  {/* --- Список товаров --- */}
                  <View className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100 mb-5">
                    {order.orderItems.map((item, idx) => {
                      const p = item.product as Product;
                      const brandName =
                        item.brand ||
                        (p?.brand && typeof p.brand === 'object' ? (p.brand as any).name : 'Бренд');
                      const itemImage = p?.images?.[0];
                      const isLast = idx === order.orderItems.length - 1;

                      return (
                        <View key={item._id || idx}>
                          <View className="flex-row items-start py-2">
                            {/* Изображение */}
                            <View className="w-[60px] h-[60px] bg-white rounded-xl overflow-hidden mr-3 items-center justify-center shrink-0">
                              {itemImage ? (
                                <Image
                                  source={itemImage}
                                  style={{ width: '100%', height: '100%' }}
                                  contentFit="contain"
                                />
                              ) : (
                                <Ionicons name="cube-outline" size={20} color="#E5E7EB" />
                              )}
                            </View>

                            {/* Текстовый блок */}
                            <View className="flex-1 pr-2">
                              <Text
                                className="text-black text-sm font-raleway-bold uppercase tracking-widest mb-0.5"
                                numberOfLines={1}
                              >
                                {brandName}
                              </Text>

                              <Text
                                className="text-black font-raleway-medium text-base tracking-wide mb-1.5 leading-4"
                                numberOfLines={1}
                              >
                                {item.name}
                              </Text>

                              {item.volume && (
                                <View className="bg-white border border-gray-300 px-2 py-[2px] rounded-[5px] self-start">
                                  <Text className="text-[9px] font-inter-semibold text-black/90 uppercase">
                                    {item.volume} мл
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Количество  */}
                            <View className="items-end justify-start pt-0">
                              <View className="bg-white border border-gray-200 px-2.5 py-1 rounded-lg">
                                <Text className="text-black font-inter-medium tracking-wide text-[11px]">
                                  x{item.quantity}
                                </Text>
                              </View>
                            </View>
                          </View>

                          {/* Разделитель */}
                          {!isLast && <View className="h-[1px] bg-gray-200/60 ml-[62px] my-1" />}
                        </View>
                      );
                    })}
                  </View>

                  {/* --- Кнопки действий --- */}
                  {order.status === 'Доставлен' && (
                    <View className="flex-row gap-3">
                      {order.hasReturnRequested ? (
                        <View className="flex-1 flex-row items-center justify-center py-3 bg-gray-50 rounded-xl border border-gray-200">
                          <Ionicons
                            name="time-outline"
                            size={17}
                            color="#9CA3AF"
                            style={{ marginRight: 6 }}
                          />
                          <Text className="text-gray-400 font-inter-semibold text-base">
                            Запрошен
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          className="flex-1 flex-row items-center justify-center py-3 bg-white border border-gray-200 rounded-xl active:bg-gray-50 shadow-sm shadow-gray-100"
                          activeOpacity={0.7}
                          onPress={() => handleOpenReturn(order)}
                        >
                          <Ionicons name="reload-outline" size={17} style={{ marginRight: 6 }} />
                          <Text className="text-black font-inter-semibold text-base">Возврат</Text>
                        </TouchableOpacity>
                      )}

                      {order.hasReviewed ? (
                        <View className="flex-1 flex-row items-center justify-center py-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                          <Ionicons name="checkmark-circle" size={17} color="#10B981" />
                          <Text
                            className="text-emerald-700 font-inter-semibold text-base ml-1.5"
                            numberOfLines={1}
                            adjustsFontSizeToFit
                          >
                            Отзыв оставлен
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          className="flex-1 flex-row items-center justify-center py-3 bg-blue-500 rounded-xl active:opacity-90 shadow-sm"
                          activeOpacity={0.8}
                          onPress={() => handleOpenRating(order)}
                        >
                          <Ionicons name="star" size={15} color="#FFFFFF" />
                          <Text className="text-white font-inter-semibold text-base ml-2">
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

      <ReturnModal
        visible={showReturnModal}
        onClose={() => setShowReturnModal(false)}
        order={selectedReturnOrder}
      />
    </SafeScreen>
  );
}
