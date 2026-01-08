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

function WishlistScreen() {
  const { wishlist, isLoading, isError, removeFromWishlist, isRemovingFromWishlist, refetch } =
    useWishlist();

  const { addToCart, isAddingToCart } = useCart();

  const [optimisticWishlist, setOptimisticWishlist] = useState(wishlist);
  const [refreshing, setRefreshing] = useState(false);

  // Состояние для модалки
  const [itemToDelete, setItemToDelete] = useState<Product | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  useEffect(() => {
    if (wishlist) {
      setOptimisticWishlist(wishlist);
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

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(
      { productId, quantity: 1 },
      {
        onError: (error: any) => {
          toast.error('Ошибка', {
            description: error?.response?.data?.error || 'Не удалось добавить',
          });
        },
      }
    );
  };

  // Хелпер для получения имени бренда в модалке и списке
  const getBrandName = (item: Product) => {
    if (item.brand && typeof item.brand === 'object' && 'name' in item.brand) {
      return (item.brand as Brand).name;
    }
    return 'Бренд';
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
      {/* --- ШАПКА --- */}
      <View className="px-6 pt-6 pb-4 bg-white flex-row items-center justify-between border-b border-gray-50">
        <Text className="text-[#111827] text-3xl font-raleway-bold tracking-tight">Избранное</Text>

        {itemsCount > 0 && (
          <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Text className="text-primary text-sm font-inter-bold">
              {itemsCount} {getDeclension(itemsCount, ['товар', 'товара', 'товаров'])}
            </Text>
          </View>
        )}
      </View>

      {/* --- КОНТЕНТ --- */}
      <ScrollView
        className="flex-1 bg-background-subtle"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#87e4ab']}
            tintColor="#87e4ab"
            progressViewOffset={25}
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
              Чтобы не потерять понравившийся товар, добавьте его в избранное
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 px-8 py-2.5 rounded-full flex-row items-center active:bg-gray-50 mt-4"
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)')}
            >
              <Text className="text-[#111827] font-inter-semibold text-base">В каталог</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 gap-4">
            {optimisticWishlist.map((item) => {
              const inStock = item.stock > 0;
              const brandName = getBrandName(item);

              return (
                <TouchableOpacity
                  key={item._id}
                  className="bg-white rounded-3xl p-4 border border-gray-200 flex-row items-start"
                  activeOpacity={0.9}
                  onPress={() => router.push(`/product/${item._id}` as any)}
                >
                  {item.isBestseller && (
                    <View className="absolute top-3 left-3.5 z-10 bg-red-400 px-2 py-1.5 rounded-full flex-row items-center shadow-sm">
                      <Ionicons
                        name="flash"
                        size={11}
                        color="#FFFFFF"
                        style={{ marginRight: 2.5 }}
                      />
                      <Text className="text-white text-xs font-inter-extrabold tracking-wider uppercase">
                        Хит
                      </Text>
                    </View>
                  )}
                  <Image
                    source={item.images[0]}
                    style={{ width: 110, height: 110, borderRadius: 16 }}
                    contentFit="cover"
                    className="bg-gray-50 border border-gray-100"
                  />

                  <View className="flex-1 ml-4 py-1">
                    <View className="flex-row justify-between items-start">
                      <Text className="text-[#9CA3AF] text-[12px] font-raleway-bold uppercase tracking-wide mt-1">
                        {brandName}
                      </Text>

                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          setItemToDelete(item);
                        }}
                        disabled={isRemovingFromWishlist}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className="bg-gray-50 p-1.5 rounded-full"
                      >
                        <Ionicons name="close" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>

                    <Text
                      className="text-[#111827] font-raleway-bold text-base leading-5 mb-2.5 -mt-2.5 pr-2"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.name}
                    </Text>

                    <View className="mb-2.5">
                      <Text className="text-[#111827] font-inter-extrabold text-xl">
                        {formatPrice(item.price)}
                      </Text>
                      {!inStock && (
                        <Text className="text-red-500 text-xs mt-1 font-inter-medium">
                          Нет в наличии
                        </Text>
                      )}
                    </View>

                    {inStock && (
                      <TouchableOpacity
                        className="bg-primary rounded-xl py-2.5 px-3 flex-row items-center justify-center shadow-sm shadow-primary/20 active:opacity-90"
                        onPress={(e) => {
                          e.stopPropagation();
                          handleAddToCart(item._id, item.name);
                        }}
                        disabled={isAddingToCart}
                      >
                        {isAddingToCart ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <Ionicons
                              name="bag-handle"
                              size={18}
                              color="#fff"
                              style={{ marginRight: 6 }}
                            />
                            <Text className="text-white font-inter-bold text-sm">В корзину</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
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
