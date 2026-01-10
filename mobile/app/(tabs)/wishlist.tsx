import { formatPrice, getDeclension } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { toast } from 'sonner-native';
import { Brand, Product } from '@/types';
import { useState, useEffect, useCallback } from 'react';

import SafeScreen from '@/components/SafeScreen';
import useWishlist from '@/hooks/useWishlist';
import ErrorState from '@/components/ErrorState';
import PageLoader from '@/components/PageLoader';
import DeleteProductModal from '@/components/modals/DeleteFromWishlistModal';

const WishlistItem = ({ item, onDelete }: { item: Product; onDelete: (item: Product) => void }) => {
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

  const availableVolumes = Array.from(
    new Set([item.volume, ...(item.variants?.map((v) => v.volume) || [])])
  )
    .filter((vol) => vol && typeof vol === 'number')
    .sort((a, b) => a - b);

  return (
    <TouchableOpacity
      className="bg-white rounded-3xl p-4 border border-gray-100 flex-row items-start mb-4 shadow-sm shadow-gray-200/50"
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${item._id}` as any)}
    >
      {/* Лейбл Хит */}
      {item.isBestseller && (
        <View className="absolute top-4 left-4 z-10 bg-white border border-black px-1.5 py-0.5 rounded-md flex-row items-center">
          <Ionicons name="flash" size={10} color="#000000" style={{ marginRight: 2.5 }} />
          <Text className="text-black text-[10px] font-inter-extrabold tracking-wider uppercase">
            Хит
          </Text>
        </View>
      )}

      {/* Изображение */}
      <Image
        source={item.images[0]}
        style={{ width: 90, height: 110, borderRadius: 16 }}
        contentFit="contain"
        className="bg-gray-50/50 border border-gray-100"
      />

      {/* Правая часть с контентом  */}
      <View className="flex-1 ml-4 mt-2 pr-1">
        {/* Верхняя строка: Бренд + Кнопка удалить */}
        <View className="flex-row justify-between items-start">
          <Text
            className="text-black text-sm font-raleway-bold uppercase tracking-widest flex-1 mr-2"
            numberOfLines={1}
          >
            {brandName}
          </Text>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDelete(item);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="bg-gray-50 p-1 rounded-full -mt-1"
          >
            <Ionicons name="close" size={14} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Название товара */}
        <Text
          className="text-black font-raleway-medium text-[15px] -mt-0.5 tracking-wide mb-1.5"
          numberOfLines={2}
        >
          {item.name}
        </Text>

        {/* Чипсы с объемами  */}
        <View className="h-9">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 20 }}
            style={{ width: '100%', overflow: 'visible' }}
          >
            {availableVolumes.map((vol, idx) => (
              <View
                key={idx}
                className="bg-white border border-gray-300 px-2 py-1 rounded-md self-start mr-1.5"
              >
                <Text className="text-[9px] font-inter-semibold text-black/85 uppercase">
                  {vol} мл
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Цена и статус */}
        <View className="flex-row items-center justify-between mt-auto">
          <Text className="text-black font-inter-semibold text-[14px]">{getPriceDisplay()}</Text>

          {!inStock && (
            <Text className="text-red-500 text-[9px] font-inter-medium uppercase tracking-wide bg-red-50 px-1.5 py-0.5 rounded ml-2">
              Нет в наличии
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
      <View className="px-6 pt-2 pb-4 bg-white flex-row items-center justify-between border-b border-gray-50">
        <Text className="text-black text-3xl font-raleway-semibold tracking-wide">Избранное</Text>
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
            <Text className="text-black font-raleway-bold text-2xl text-center">
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
