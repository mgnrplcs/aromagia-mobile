import SafeScreen from '@/components/SafeScreen';
import useCart from '@/hooks/useCart';
import useWishlist from '@/hooks/useWishlist';
import { formatPrice, getDeclension } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { toast } from 'sonner-native';
import { Brand } from '@/types/types';

function WishlistScreen() {
  const { wishlist, isLoading, isError, removeFromWishlist, isRemovingFromWishlist } =
    useWishlist();

  const { addToCart, isAddingToCart } = useCart();

  const handleRemoveFromWishlist = (productId: string, productName: string) => {
    removeFromWishlist(productId);
    toast.success('Удалено', { description: 'Товар убран из избранного' });
  };

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(
      { productId, quantity: 1 },
      {
        onSuccess: () =>
          toast.success('Успешно', { description: `${productName} добавлен в корзину!` }),
        onError: (error: any) => {
          toast.error('Ошибка', {
            description: error?.response?.data?.error || 'Не удалось добавить',
          });
        },
      }
    );
  };

  if (isLoading) return <LoadingUI />;
  if (isError) return <ErrorUI />;

  const itemsCount = wishlist.length;

  return (
    <SafeScreen>
      {/* ШАПКА */}
      <View className="px-6 pt-6 pb-4 bg-white flex-row items-center justify-between border-b border-gray-50 z-10">
        <Text className="text-[#111827] text-3xl font-raleway-bold tracking-tight">Избранное</Text>

        {itemsCount > 0 && (
          <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            <Text className="text-primary text-sm font-inter-bold">
              {itemsCount} {getDeclension(itemsCount, ['товар', 'товара', 'товаров'])}
            </Text>
          </View>
        )}
      </View>

      {/* КОНТЕНТ */}
      <ScrollView
        className="flex-1 bg-background-subtle"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
      >
        {itemsCount === 0 ? (
          <View className="flex-1 items-center justify-center px-6 mt-40">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="heart-outline" size={48} color="#D1D5DB" />
            </View>
            <Text className="text-[#111827] font-raleway-bold text-2xl text-center">
              Ваш список пуст
            </Text>
            <Text className="text-[#6B7280] text-center mt-3 font-inter-light leading-6 px-8 text-base">
              Добавляйте товары, кликая на сердечко в каталоге
            </Text>
            <TouchableOpacity
              className="bg-primary rounded-2xl px-10 py-4 mt-8 shadow-lg shadow-primary/20"
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)')}
            >
              <Text className="text-white font-inter-bold text-base">В каталог</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 gap-4">
            {wishlist.map((item) => {
              const inStock = item.stock > 0;
              let brandName = 'Бренд';
              if (item.brand && typeof item.brand === 'object' && 'name' in item.brand) {
                brandName = (item.brand as Brand).name;
              }

              return (
                <TouchableOpacity
                  key={item._id}
                  className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex-row items-start"
                  activeOpacity={0.9}
                  onPress={() => router.push(`/product/${item._id}` as any)}
                >
                  {/* === БЕЙДЖИК ХИТ === */}
                  {item.isBestseller && (
                    <View className="absolute top-3 left-3 z-10 bg-red-400 px-2.5 py-1.5 rounded-full flex-row items-center shadow-sm">
                      <Ionicons name="flash" size={11} color="#FFFFFF" style={{ marginRight: 3 }} />
                      <Text className="text-white text-xs font-inter-extrabold uppercase">Хит</Text>
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
                      <Text className="text-[#9CA3AF] text-xs font-inter-bold uppercase tracking-wide mt-1">
                        {brandName}
                      </Text>

                      <TouchableOpacity
                        onPress={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWishlist(item._id, item.name);
                        }}
                        disabled={isRemovingFromWishlist}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        className="bg-gray-50 p-1.5 rounded-full"
                      >
                        <Ionicons name="close" size={18} color="#9CA3AF" />
                      </TouchableOpacity>
                    </View>

                    <Text
                      className="text-[#111827] font-raleway-bold text-base leading-5 mb-2.5 -mt-1.5"
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>

                    <View className="mb-3">
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
                              style={{ marginRight: 7 }}
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
    </SafeScreen>
  );
}

export default WishlistScreen;

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center bg-background-subtle">
        <ActivityIndicator size="large" color="#87e4ab" />
      </View>
    </SafeScreen>
  );
}

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6 bg-background-subtle">
        <Ionicons name="cloud-offline-outline" size={64} color="#EF4444" />
        <Text className="text-[#111827] font-raleway-bold text-xl mt-6 text-center">Ошибка</Text>
        <Text className="text-[#6B7280] text-center mt-2 mb-6 font-inter-medium">
          Не удалось загрузить список избранного
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          className="bg-gray-200 px-6 py-3 rounded-xl"
        >
          <Text className="font-inter-medium">На главную</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}
