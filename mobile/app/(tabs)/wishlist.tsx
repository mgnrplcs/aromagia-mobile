import { formatPrice, getDeclension } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { toast } from 'sonner-native';
import { Brand, Product } from '@/types';
import { useState, useEffect, useCallback } from 'react';

import SafeScreen from '@/components/SafeScreen';
import useCart from '@/hooks/useCart';
import useWishlist from '@/hooks/useWishlist';
import ErrorState from '@/components/ErrorState';
import PageLoader from '@/components/PageLoader';
import DeleteProductModal from '@/components/modals/DeleteFromWishlistModal';

// --- КОМПОНЕНТ ЭЛЕМЕНТА ВИШЛИСТА (чтобы хуки работали) ---
const WishlistItem = ({ item, onDelete }: { item: Product; onDelete: (item: Product) => void }) => {
  // Хелпер бренда
  const getBrandName = (product: Product) => {
    if (product.brand && typeof product.brand === 'object' && 'name' in product.brand) {
      return (product.brand as Brand).name;
    }
    return 'Бренд';
  };

  const brandName = getBrandName(item);
  const inStock = item.stock > 0;

  // Расчет диапазона цен
  const getPriceDisplay = () => {
    if (!item.variants || item.variants.length === 0) {
      return formatPrice(item.price);
    }

    const prices = item.variants.map((v) => v.price);
    const minPrice = Math.min(...prices, item.price);
    const maxPrice = Math.max(...prices, item.price);

    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }

    return `${formatPrice(minPrice).replace(' ₽', '')} - ${formatPrice(maxPrice)}`;
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-3xl p-4 border border-gray-100 flex-row items-center mb-4 shadow-sm shadow-gray-200/50"
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${item._id}` as any)}
    >
      {item.isBestseller && (
        <View className="absolute top-3 left-3.5 z-10 bg-red-400 px-2.5 py-1.5 rounded-full flex-row items-center shadow-sm">
          <Ionicons name="flash" size={11} color="#FFFFFF" style={{ marginRight: 2.5 }} />
          <Text className="text-white text-[10px] font-inter-extrabold tracking-wider uppercase">
            Хит
          </Text>
        </View>
      )}

      <Image
        source={item.images[0]}
        style={{ width: 90, height: 90, borderRadius: 20 }}
        contentFit="contain"
        className="bg-gray-50/50 border border-gray-100"
      />

      <View className="flex-1 ml-4 justify-center">
        {/* Хедер карточки */}
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-gray-400 text-[10px] font-inter-bold uppercase tracking-widest">
            {brandName}
          </Text>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="bg-gray-50 p-1.5 rounded-full"
          >
            <Ionicons name="close" size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <Text
          className="text-black font-raleway-bold text-base mb-1"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>

        {/* Чипсы с объемами */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="flex-row mb-2"
        >
          {Array.from(new Set([item.volume, ...(item.variants?.map(v => v.volume) || [])]))
            .filter(vol => vol && typeof vol === 'number')
            .sort((a, b) => a - b)
            .map((vol, idx) => (
              <View
                key={idx}
                className="bg-gray-100/80 px-2 py-0.5 rounded-md mr-1.5 border border-gray-200/50"
              >
                <Text className="text-gray-600 font-inter-semibold text-[10px]">
                  {vol} мл
                </Text>
              </View>
            ))
          }
        </ScrollView>

        <View className="flex-row items-center justify-between">
          <Text className="text-black font-inter-bold text-[17px]">
            {getPriceDisplay()}
          </Text>

          {!inStock && (
            <Text className="text-red-500 text-[10px] font-inter-medium uppercase tracking-wide bg-red-50 px-2 py-1 rounded-lg">
              Out of stock
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// --- ГЛАВНЫЙ ЭКРАН ---
function WishlistScreen() {
  const { wishlist, isLoading, isError, removeFromWishlist, refetch } = useWishlist();

  const [optimisticWishlist, setOptimisticWishlist] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Product | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useEffect(() => {
    if (wishlist) {
      setOptimisticWishlist(wishlist as Product[]);
    }
  }, [wishlist]);

  const confirmDelete = () => {
    if (!itemToDelete) return;
    const productId = itemToDelete._id;
    const previousList = [...optimisticWishlist];

    setOptimisticWishlist((prev) => prev.filter((item) => item._id !== productId));
    setItemToDelete(null);

    removeFromWishlist(productId, {
      onError: () => {
        setOptimisticWishlist(previousList);
        toast.error('Ошибка', { description: 'Не удалось удалить товар' });
      },
    });
  };

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <SafeScreen>
        <ErrorState onRetry={refetch} showBackButton={true} />
      </SafeScreen>
    );
  }

  const itemsCount = optimisticWishlist.length;

  return (
    <SafeScreen>
      <View className="px-6 pt-6 pb-4 bg-white flex-row items-center justify-between border-b border-gray-50">
        <Text className="text-[#111827] text-3xl font-raleway-bold tracking-tight">Избранное</Text>
        {itemsCount > 0 && (
          <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Text className="text-primary text-sm font-inter-semibold tracking-wide">
              {itemsCount} {getDeclension(itemsCount, ['товар', 'товара', 'товаров'])}
            </Text>
          </View>
        )}
      </View>

      <ScrollView
        className="flex-1 bg-background-subtle"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#111827']}
            tintColor="#111827"
          />
        }
      >
        {itemsCount === 0 ? (
          <View className="flex-1 items-center justify-center px-6 mt-48">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-4">
              <Ionicons name="heart-outline" size={48} color="#FF453A" />
            </View>
            <Text className="text-[#111827] font-raleway-bold text-2xl text-center">
              Ваш список пуст
            </Text>
            <Text className="text-[#6B7280] text-center mt-2.5 font-inter-light leading-7 px-8 text-[15px]">
              Добавляйте понравившиеся товары, чтобы не потерять их
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
          <View className="px-6">
            {optimisticWishlist.map((item) => (
              <WishlistItem key={item._id} item={item} onDelete={(prod) => setItemToDelete(prod)} />
            ))}
          </View>
        )}
      </ScrollView>

      <DeleteProductModal
        visible={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        product={itemToDelete}
      />
    </SafeScreen>
  );
}

export default WishlistScreen;
