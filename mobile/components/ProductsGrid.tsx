import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { formatPrice } from '@/lib/utils';
import useCart from '@/hooks/useCart';
import useWishlist from '@/hooks/useWishlist';
import { toast } from 'sonner-native';
import { Brand, Product } from '@/types';
import * as Haptics from 'expo-haptics';
import PageLoader from './PageLoader';
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

  // 3. ПУСТО (Красивая заглушка)
  if (products.length === 0) {
    return (
      <View className="items-center justify-center min-h-[450px]">
        <View className="bg-gray-50 p-5 rounded-full mb-3">
          <Ionicons name="search" size={32} color="#9CA3AF" />
        </View>
        <Text className="text-[#111827] font-raleway-medium text-lg">Ничего не найдено</Text>
        <Text className="text-[#6B7280] font-inter-light mt-1 text-base">
          Попробуйте изменить запрос или фильтры
        </Text>
      </View>
    );
  }

  // 4. СПИСОК ТОВАРОВ
  return (
    <View className="flex-row flex-wrap justify-between pb-10">
      {products.map((item) => (
        <ProductCard key={item._id} item={item} />
      ))}
    </View>
  );
};

// --- КАРТОЧКА ТОВАРА  ---
const ProductCard = ({ item }: { item: Product }) => {
  const { addToCart, isAddingToCart } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  const isActuallyInWishlist = wishlist.some((w) => w._id === item._id);
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

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addToCart(
      { productId: item._id, quantity: 1 },
      {
        onSuccess: () => toast.success('В корзине!'),
      }
    );
  };

  return (
    <TouchableOpacity
      className="bg-white w-[48%] rounded-[20px] p-3 mb-4 border border-gray-200"
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${item._id}` as any)}
    >
      <View className="relative mb-3">
        <TouchableOpacity
          className="absolute top-0.5 right-1 z-10 w-8 h-8 rounded-full bg-white/80 items-center justify-center backdrop-blur-md"
          onPress={(e) => {
            e.stopPropagation();
            handleWishlistPress();
          }}
        >
          <Ionicons
            name={isLiked ? 'heart' : 'heart-outline'}
            size={22}
            color={isLiked ? '#EF4444' : '#9CA3AF'}
          />
        </TouchableOpacity>

        {item.isBestseller && (
          <View className="absolute top-1 left-0.5 z-10 bg-red-400 px-2 py-1.5 rounded-full flex-row items-center">
            <Ionicons name="flash" size={11} color="#FFFFFF" style={{ marginRight: 2.5 }} />
            <Text className="text-white text-[10px] font-inter-extrabold tracking-wider uppercase">
              Хит
            </Text>
          </View>
        )}

        <Image
          source={item.images[0]}
          style={{ width: '100%', height: 140, borderRadius: 16 }}
          contentFit="cover"
          className="bg-gray-50"
        />
      </View>

      <View className="mt-2">
        <Text
          className="text-[#111827] text-[12px] font-raleway-bold uppercase tracking-widest mb-0.5"
          numberOfLines={1}
        >
          {brandName}
        </Text>

        <Text
          className="text-[#111827] font-raleway-medium text-[14px] tracking-wide leading-[18px] h-9"
          numberOfLines={2}
          textBreakStrategy="highQuality"
        >
          {item.name}
        </Text>

        <Text className="text-[#111827] font-inter-extrabold text-[17px] -mt-1 mb-3">
          {formatPrice(item.price)}
        </Text>

        {item.stock > 0 ? (
          <TouchableOpacity
            className="bg-primary w-full py-2.5 rounded-xl flex-row items-center justify-center active:bg-primary-dark"
            onPress={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <Ionicons name="bag-handle" size={16} color="white" style={{ marginRight: 6 }} />
                <Text className="text-white font-inter-bold text-[13px]">В корзину</Text>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View className="bg-gray-100 w-full py-2.5 rounded-xl items-center justify-center">
            <Text className="text-gray-400 font-inter-bold text-[12px]">Нет в наличии</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductsGrid;
