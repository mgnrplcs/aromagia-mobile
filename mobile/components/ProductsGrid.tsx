import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { formatPrice } from '@/lib/utils';
import useWishlist from '@/hooks/useWishlist';
import { toast } from 'sonner-native';
import { Brand, Product } from '@/types';
import * as Haptics from 'expo-haptics';
import PageLoader from '../components/PageLoader';
import ErrorState from '@/components/ErrorState';

interface ProductsGridProps {
  products: Product[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry?: () => void;
}

const ProductsGrid = ({ products, isLoading, isError, onRetry }: ProductsGridProps) => {
  if (isLoading) {
    return <PageLoader />;
  }

  if (isError || !products) {
    return <ErrorState onRetry={onRetry} contentContainerStyle="bg-transparent mt-24" />;
  }

  if (products.length === 0) {
    return (
      <View className="items-center justify-center min-h-[450px]">
        <View className="bg-gray-50 p-5 rounded-full mb-3">
          <Ionicons name="search" size={32} color="#9CA3AF" />
        </View>
        <Text className="text-[#111827] font-raleway-medium text-lg">Ничего не найдено</Text>
        <Text className="text-[#6B7280] font-inter-light mt-1 text-base">
          Попробуйте изменить параметры поиска
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-row flex-wrap justify-between">
      {products.map((item) => (
        <ProductCard key={item._id} item={item} />
      ))}
    </View>
  );
};

// --- Карточка товара ---
const ProductCard = ({ item }: { item: Product }) => {
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const isActuallyInWishlist = wishlist?.some((w) => w._id === item._id) || false;
  const [isLiked, setIsLiked] = useState(isActuallyInWishlist);

  useEffect(() => {
    setIsLiked(isActuallyInWishlist);
  }, [isActuallyInWishlist]);

  let brandName = 'Бренд';
  if (item.brand && typeof item.brand === 'object' && 'name' in item.brand) {
    brandName = (item.brand as Brand).name;
  }

  const handleWishlistPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newStatus = !isLiked;
    setIsLiked(newStatus);

    if (newStatus) {
      addToWishlist(item._id, {
        onError: () => {
          setIsLiked(false);
          toast.error('Ошибка', { description: 'Не удалось добавить' });
        },
      });
    } else {
      removeFromWishlist(item._id, {
        onError: () => {
          setIsLiked(true);
          toast.error('Ошибка', { description: 'Не удалось удалить' });
        },
      });
    }
  };

  // Вычисление цены
  const getPriceDisplay = () => {
    if (item.variants && item.variants.length > 0) {
      const prices = item.variants.map((v) => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      if (min === max) return formatPrice(min);
      return `${formatPrice(min)} – ${formatPrice(max)}`;
    }
    return formatPrice(item.price);
  };

  // Получение списка объемов
  const volumes =
    item.variants && item.variants.length > 0
      ? item.variants.map((v) => v.volume).sort((a, b) => a - b)
      : [item.volume];

  return (
    <TouchableOpacity
      className="bg-white w-[48%] rounded-[10px] p-3 mb-4 border border-gray-100 shadow-sm"
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${item._id}` as any)}
    >
      <View className="relative mb-3">
        <TouchableOpacity
          className="absolute top-1 right-1 z-10 w-8 h-8 rounded-full bg-white/70 items-center justify-center shadow-sm"
          onPress={(e) => {
            e.stopPropagation();
            handleWishlistPress();
          }}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={19}
            color={isLiked ? '#EF4444' : '#111827'}
          />
        </TouchableOpacity>

        {item.isBestseller && (
          <View className="absolute top-1 left-1.5 z-10 bg-white border border-black px-1.5 py-0.5 rounded-md flex-row items-center">
            <Ionicons name="flash" size={10} color="#000000" style={{ marginRight: 2.5 }} />
            <Text className="text-black text-[10px] font-inter-extrabold tracking-wider uppercase">
              Хит
            </Text>
          </View>
        )}

        <Image
          source={item.images[0]}
          style={{ width: '100%', height: 160, borderRadius: 16 }}
          contentFit="cover"
          className="bg-gray-50"
        />
      </View>

      <View className="px-1">
        <Text
          className="text-black text-sm font-raleway-bold uppercase tracking-widest"
          numberOfLines={1}
        >
          {brandName}
        </Text>

        <Text
          className="text-black font-raleway-medium text-[15px] -mt-0.5 tracking-wide mb-1.5"
          numberOfLines={1}
        >
          {item.name}
        </Text>

        <View className="h-9">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 40 }}
            style={{ width: '100%', overflow: 'visible' }}
          >
            {volumes.map((vol, index) => (
              <View
                key={vol}
                className="bg-white border border-gray-300 px-2 py-1 rounded-md self-start mr-1.5"
              >
                <Text className="text-[9px] font-inter-semibold text-black/85 uppercase">
                  {vol} мл
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <Text className="text-black font-inter-semibold mb-1 text-[14px]">{getPriceDisplay()}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProductsGrid;
