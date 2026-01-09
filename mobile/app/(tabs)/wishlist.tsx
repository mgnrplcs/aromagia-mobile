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
  const { cart, addToCart, updateQuantity, removeFromCart, isUpdating, isRemoving } = useCart();

  // Ищем товар в корзине
  const cartItem = cart?.items.find(
    (cartItem) =>
      (typeof cartItem.product === 'string' ? cartItem.product : cartItem.product._id) === item._id
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleIncrease = () => {
    updateQuantity({ productId: item._id, quantity: quantityInCart + 1 });
  };

  const handleDecrease = () => {
    if (quantityInCart === 1) removeFromCart(item._id);
    else updateQuantity({ productId: item._id, quantity: quantityInCart - 1 });
  };

  // Хелпер бренда
  const getBrandName = (product: Product) => {
    if (product.brand && typeof product.brand === 'object' && 'name' in product.brand) {
      return (product.brand as Brand).name;
    }
    return 'Бренд';
  };

  const brandName = getBrandName(item);
  const inStock = item.stock > 0;

  return (
    <TouchableOpacity
      className="bg-white rounded-3xl p-4 border border-gray-200 flex-row items-start mb-4"
      activeOpacity={0.9}
      onPress={() => router.push(`/product/${item._id}` as any)}
    >
      {item.isBestseller && (
        <View className="absolute top-3 left-3.5 z-10 bg-red-400 px-2.5 py-1.5 rounded-full flex-row items-center shadow-sm">
          <Ionicons name="flash" size={11} color="#FFFFFF" style={{ marginRight: 2.5 }} />
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
        {/* Хедер карточки */}
        <View className="flex-row justify-between items-start">
          <Text className="text-black text-sm font-raleway-bold uppercase tracking-widest mt-1">
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
            <Ionicons name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <Text
          className="text-black font-raleway-medium tracking-wide text-lg mb-1 -mt-2"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {item.name}
        </Text>

        <View className="mb-2.5">
          <Text className="text-black font-inter-bold text-xl">{formatPrice(item.price)}</Text>
          {!inStock && (
            <Text className="text-red-500 text-xs mt-1 font-inter-medium">Нет в наличии</Text>
          )}
        </View>

        {/* Кнопка добавления в корзину */}
        {inStock && (
          <View>
            {!cartItem ? (
              <TouchableOpacity
                className="bg-black py-2.5 rounded-xl flex-row items-center justify-center active:bg-gray-800 shadow-sm"
                onPress={(e) => {
                  e.stopPropagation();
                  addToCart({ productId: item._id, quantity: 1 });
                }}
                disabled={isUpdating}
              >
                <Ionicons name="bag-handle" size={18} color="#fff" style={{ marginRight: 6 }} />
                <Text className="text-white font-inter-bold tracking-wide text-[13px]">
                  В корзину
                </Text>
              </TouchableOpacity>
            ) : (
              // Кнопка со счетчиком
              <View className="flex-row h-[40px] shadow-sm rounded-xl overflow-hidden border border-gray-200 bg-white">
                {/* Левая часть: Перейти в корзину */}
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push('/(tabs)/cart');
                  }}
                  className="bg-blue-500 w-11 items-center justify-center h-full active:bg-blue-600"
                >
                  <Ionicons name="bag-check" size={18} color="white" />
                </TouchableOpacity>

                {/* Правая часть: Счетчик */}
                <View className="flex-1 flex-row items-center justify-between px-3 bg-white h-full border-l border-gray-100">
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDecrease();
                    }}
                    disabled={isUpdating || isRemoving}
                    className="w-7 h-7 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100 border border-gray-100"
                  >
                    {isRemoving ? (
                      <ActivityIndicator size="small" color="#111827" />
                    ) : (
                      <Ionicons name="remove" size={16} color="#111827" />
                    )}
                  </TouchableOpacity>

                  <Text className="text-[#111827] font-inter-bold text-[15px] mx-2 min-w-[20px] text-center">
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
                    className="w-7 h-7 bg-gray-50 rounded-full items-center justify-center active:bg-gray-100 border border-gray-100"
                  >
                    <Ionicons name="add" size={16} color="#111827" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        )}
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
