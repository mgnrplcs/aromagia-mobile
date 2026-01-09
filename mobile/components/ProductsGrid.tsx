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
    <View className="flex-row flex-wrap justify-between pb-10">
      {products.map((item) => (
        <ProductCard key={item._id} item={item} />
      ))}
    </View>
  );
};

// --- КАРТОЧКА ТОВАРА ---
const ProductCard = ({ item }: { item: Product }) => {
  // Хук корзины
  const { cart, addToCart, updateQuantity, removeFromCart, isUpdating, isRemoving } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();

  // Логика корзины для ЭТОГО товара
  const cartItem = cart?.items.find(
    (cItem) => (typeof cItem.product === 'string' ? cItem.product : cItem.product._id) === item._id
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleIncrease = () => {
    updateQuantity({ productId: item._id, quantity: quantityInCart + 1 });
  };

  const handleDecrease = () => {
    if (quantityInCart === 1) removeFromCart(item._id);
    else updateQuantity({ productId: item._id, quantity: quantityInCart - 1 });
  };

  // Логика вишлиста
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
          <View className="absolute top-1 left-0.5 z-10 bg-red-400 px-2.5 py-1.5 rounded-full flex-row items-center">
            <Ionicons name="flash" size={11} color="#FFFFFF" style={{ marginRight: 2.5 }} />
            <Text className="text-white text-xs font-inter-extrabold tracking-wider uppercase">
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
          className="text-black text-sm font-raleway-bold uppercase tracking-widest"
          numberOfLines={1}
        >
          {brandName}
        </Text>

        <Text
          className="text-black font-raleway-medium text-[15px] tracking-wide h-8"
          numberOfLines={1}
          textBreakStrategy="highQuality"
        >
          {item.name}
        </Text>

        <Text className="text-black font-inter-bold text-[17px] mb-3">
          {formatPrice(item.price)}
        </Text>

        {/* КНОПКА ДОБАВЛЕНИЯ */}
        {item.stock > 0 ? (
          <View>
            {!cartItem ? (
              <TouchableOpacity
                className="bg-black w-full py-2.5 rounded-xl flex-row items-center justify-center active:bg-gray-800"
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  addToCart({ productId: item._id, quantity: 1 });
                }}
                disabled={isUpdating} // Используем isUpdating, так как addToCartMutation тоже меняет состояние
              >
                <Ionicons name="bag-handle" size={16} color="white" style={{ marginRight: 6 }} />
                <Text className="text-white font-inter-bold tracking-wide text-[13px]">
                  В корзину
                </Text>
              </TouchableOpacity>
            ) : (
              // Кнопка в корзине
              <View className="flex-row h-[40px] w-full shadow-sm rounded-xl overflow-hidden border border-gray-200 bg-white">
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push('/(tabs)/cart');
                  }}
                  className="bg-blue-500 w-10 items-center justify-center h-full active:bg-blue-600"
                >
                  <Ionicons name="bag-check" size={18} color="white" />
                </TouchableOpacity>

                <View className="flex-1 flex-row items-center justify-between px-2 bg-white h-full">
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDecrease();
                    }}
                    disabled={isUpdating || isRemoving}
                    className="w-7 h-7 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
                  >
                    {isRemoving ? (
                      <ActivityIndicator size="small" color="#111827" />
                    ) : (
                      <Ionicons name="remove" size={14} color="#111827" />
                    )}
                  </TouchableOpacity>

                  <Text className="text-[#111827] font-inter-bold text-[14px]">
                    {isUpdating ? (
                      <ActivityIndicator size="small" color="#111827" />
                    ) : (
                      quantityInCart
                    )}
                  </Text>

                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleIncrease();
                    }}
                    disabled={isUpdating || quantityInCart >= item.stock}
                    className="w-7 h-7 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100"
                  >
                    <Ionicons name="add" size={14} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
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
