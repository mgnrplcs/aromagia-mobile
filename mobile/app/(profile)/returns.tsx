import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useReturns } from '@/hooks/useReturns';
import SafeScreen from '@/components/SafeScreen';
import PageLoader from '@/components/PageLoader';
import ErrorState from '@/components/ErrorState';

import { formatDate, getDeclension } from '@/lib/utils';
import { Product, ReturnRequest } from '@/types';

export default function ReturnsScreen() {
  const { returns, isLoading, isError, refetch } = useReturns();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // --- Стили статусов ---
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Ожидает рассмотрения':
        return {
          container: 'bg-amber-500/10 border-amber-500/20',
          text: 'text-amber-600',
          label: 'На проверке',
        };
      case 'Одобрено':
      case 'Возврат выполнен':
        return {
          container: 'bg-emerald-500/10 border-emerald-500/20',
          text: 'text-emerald-600',
          label: 'Одобрено',
        };
      case 'Отклонено':
        return {
          container: 'bg-red-500/10 border-red-500/20',
          text: 'text-red-600',
          label: 'Отклонено',
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
          description="Не удалось загрузить историю возвратов"
          onRetry={refetch}
          showBackButton={true}
        />
      </SafeScreen>
    );
  }

  const returnsList = (returns as ReturnRequest[]) || [];

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
          <Text className="text-black text-2xl font-raleway-semibold tracking-wide">Возвраты</Text>
        </View>
        {returnsList.length > 0 && (
          <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Text className="text-primary text-sm font-inter-semibold tracking-wide">
              {returnsList.length}{' '}
              {getDeclension(returnsList.length, ['заявка', 'заявки', 'заявок'])}
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
        {returnsList.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 mt-48">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="reload-circle-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-black font-raleway-bold text-2xl text-center">Нет заявок</Text>
            <Text className="text-gray-500 text-center mt-2 font-inter-medium px-8 leading-6">
              Здесь будут отображаться ваши заявки на возврат товаров.
            </Text>
          </View>
        ) : (
          <View className="px-5">
            {returnsList.map((returnReq, index) => {
              const statusConfig = getStatusConfig(returnReq.status);
              const marginBottom = index === returnsList.length - 1 ? 'mb-0' : 'mb-5';

              const rawOrderId =
                typeof returnReq.order === 'object'
                  ? (returnReq.order as any)._id
                  : returnReq.order;
              const displayOrderId = rawOrderId
                ? rawOrderId.toString().slice(-6).toUpperCase()
                : '???';

              return (
                <View
                  key={returnReq._id}
                  className={`bg-white rounded-[24px] p-5 shadow-sm shadow-gray-200/60 border border-gray-100 ${marginBottom}`}
                >
                  {/* --- Шапка --- */}
                  <View className="flex-row justify-between items-start mb-4">
                    <View>
                      <Text className="text-black font-inter-semibold text-lg">
                        Заявка №{returnReq._id.slice(-6).toUpperCase()}
                      </Text>
                      <Text className="text-gray-400 font-inter text-sm mt-0.5">
                        от {formatDate(returnReq.createdAt)}
                      </Text>
                    </View>
                    <View className={`px-2.5 py-1 rounded-lg ${statusConfig.container}`}>
                      <Text
                        className={`${statusConfig.text} text-[10px] font-inter-bold tracking-wider uppercase`}
                      >
                        {statusConfig.label}
                      </Text>
                    </View>
                  </View>

                  {/* --- Инфо-блок --- */}
                  <View className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="text-gray-500 text-sm tracking-wide font-inter">Заказ</Text>
                      <Text className="text-black font-inter-semibold text-sm">
                        №{displayOrderId}
                      </Text>
                    </View>

                    <View className="h-[1px] bg-gray-200 w-full mb-3" />

                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-500 text-sm tracking-wide font-inter mb-0.5">
                        Причина возврата
                      </Text>
                      <Text className="text-red-500 font-inter-semibold text-sm">
                        {returnReq.reason}
                      </Text>
                    </View>
                  </View>

                  {/* --- Список товаров --- */}
                  <View className="bg-gray-50/50 rounded-2xl p-3 border border-gray-100">
                    {returnReq.items.map((item, idx) => {
                      const p = item.product as Product;
                      const isProductPopulated = p && typeof p === 'object';

                      const brandName =
                        isProductPopulated && p.brand && typeof p.brand === 'object'
                          ? (p.brand as any).name
                          : 'Бренд';
                      const productName = isProductPopulated ? p.name : 'Товар удален';
                      const itemImage = isProductPopulated ? p.images?.[0] : null;
                      const itemVolume = isProductPopulated ? p.volume : null;
                      const isLast = idx === returnReq.items.length - 1;

                      return (
                        <View key={idx}>
                          <View className="flex-row items-start py-3">
                            {/* Фото */}
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

                            {/* Инфо */}
                            <View className="flex-1 pr-2">
                              <Text
                                className="text-black text-sm font-raleway-bold uppercase tracking-widest"
                                numberOfLines={1}
                              >
                                {brandName}
                              </Text>

                              <Text
                                className="text-black font-raleway-medium text-base tracking-wide mb-1"
                                numberOfLines={2}
                              >
                                {productName}
                              </Text>

                              {itemVolume && (
                                <View className="bg-white border border-gray-300 px-1.5 py-[2px] rounded-[5px] self-start">
                                  <Text className="text-[9px] font-inter-semibold text-black/90 uppercase">
                                    {itemVolume} мл
                                  </Text>
                                </View>
                              )}
                            </View>

                            {/* Количество */}
                            <View className="pt-1">
                              <View className="bg-white border border-gray-200 px-2 py-1 rounded-lg">
                                <Text className="text-black font-inter-medium tracking-wide text-sm">
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

                  {/* Комментарий админа */}
                  {returnReq.adminComment && (
                    <View className="mt-4 bg-red-50 p-3 rounded-xl border border-red-100">
                      <Text className="text-red-800 text-[10px] font-inter-bold uppercase mb-1">
                        Ответ поддержки:
                      </Text>
                      <Text className="text-black/80 text-xs font-inter leading-4">
                        {returnReq.adminComment}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
