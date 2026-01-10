import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { toast } from 'sonner-native';

import SafeScreen from '@/components/SafeScreen';
import PageLoader from '@/components/PageLoader';
import ErrorState from '@/components/ErrorState';
import { useCoupons, CouponData } from '@/hooks/useCoupons';
import { formatDate, getDeclension } from '@/lib/utils';

const CouponTicket = ({ item }: { item: CouponData }) => {
  const isExpired = new Date(item.validUntil) < new Date();

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(item.code);
    toast.success('Скопировано', {
      description: `Промокод ${item.code} скопирован`,
    });
  };

  return (
    <View className="w-full mb-4">
      <View className="flex-row justify-end mb-2 mr-1">
        <View className="flex-row items-center bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100">
          <Ionicons
            name="time-outline"
            size={10}
            color="#f97316"
            style={{ marginRight: 4, fontWeight: '900' }}
          />
          <Text className="text-orange-400 font-inter-semibold text-xs">
            Истекает {formatDate(item.validUntil)}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={copyToClipboard}
        className="flex-row w-full h-32 shadow-sm shadow-gray-200 bg-transparent"
      >
        <View className="w-[40%] bg-white rounded-l-2xl justify-center items-center py-3 px-1 border-t border-b border-l border-gray-200">
          <View className="items-center">
            <Text className="text-black mt-1 font-inter-bold text-3xl">
              {item.discountAmount} ₽
            </Text>
          </View>

          <View className="flex-row h-6 items-end justify-center gap-1 opacity-25 my-2">
            {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 4, 1, 2].map((w, i) => (
              <View key={i} style={{ width: w }} className="h-full bg-black rounded-sm" />
            ))}
          </View>
        </View>

        <View className="relative w-[1px] h-full bg-transparent z-10">
          <View className="absolute top-0 bottom-0 left-0 w-[1px] border-l border-dashed border-gray-300 h-full bg-white" />
          <View className="absolute -top-3 -left-3 w-6 h-6 bg-[#F9FAFB] rounded-full border-b border-gray-200" />
          <View className="absolute -bottom-3 -left-3 w-6 h-6 bg-[#F9FAFB] rounded-full border-t border-gray-200" />
        </View>

        <View className="flex-1 bg-blue-600 rounded-r-2xl justify-center items-center relative overflow-hidden">
          <View className="absolute -right-6 -bottom-6 w-20 h-20 bg-white/10 rounded-full" />
          <View className="absolute top-2 right-3 w-2 h-2 bg-white/20 rounded-full" />

          <View className="items-center z-10 pb-4">
            <Text className="text-white/70 text-xs font-inter-semibold uppercase tracking-widest mb-2">
              PROMO CODE
            </Text>

            <View className="flex-row items-center bg-white/20 px-4 py-2 rounded-xl border border-white/10">
              <Text
                className="text-white font-inter-extrabold text-lg tracking-wider mr-3"
                numberOfLines={1}
              >
                {item.code}
              </Text>
              <Ionicons name="copy-outline" size={16} color="white" />
            </View>
          </View>

          <Text className="absolute bottom-2.5 text-white/60 tracking-wide text-xs font-inter-medium">
            Нажми, чтобы скопировать
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default function CouponsScreen() {
  const { data: coupons, isLoading, isError, refetch } = useCoupons();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <SafeScreen>
        <ErrorState
          title="Ошибка"
          description="Не удалось загрузить промокоды"
          onRetry={refetch}
          showBackButton={true}
        />
      </SafeScreen>
    );
  }

  const allowedCodes = ['WELCOME500', 'VIP_CLIENT'];
  const couponsList = (coupons || []).filter((c) => allowedCodes.includes(c.code.toUpperCase()));

  const itemsCount = couponsList.length;

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
          <Text className="text-black text-2xl font-raleway-semibold tracking-wide">Промокоды</Text>
        </View>

        {itemsCount > 0 && (
          <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            <Text className="text-blue-600 text-sm font-inter-semibold tracking-wide">
              {itemsCount} {getDeclension(itemsCount, ['купон', 'купона', 'купонов'])}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 bg-[#F9FAFB]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111827" />
        }
      >
        {itemsCount === 0 ? (
          <View className="flex-1 items-center justify-center px-6 mt-48">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="ticket-outline" size={48} color="#9CA3AF" />
            </View>
            <Text className="text-black font-raleway-bold text-2xl text-center">
              Нет промокодов
            </Text>
            <Text className="text-gray-500 text-center mt-2 font-inter-medium px-8 leading-6">
              Персональные предложения появятся здесь.
            </Text>
          </View>
        ) : (
          <View className="px-5">
            {couponsList.map((coupon) => (
              <CouponTicket key={coupon._id} item={coupon} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}
