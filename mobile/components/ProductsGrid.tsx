import useCart from '@/hooks/useCart';
import useWishlist from '@/hooks/useWishlist';
import { Product } from '@/types/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { toast } from 'sonner-native';
import { formatPrice } from '@/lib/utils'; // Импортируем форматтер

interface ProductsGridProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
}

const ProductsGrid = ({ products, isLoading, isError }: ProductsGridProps) => {
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const { isAddingToCart, addToCart } = useCart();

  const handleAddToCart = (productId: string, productName: string) => {
    addToCart(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success('Успешно', {
            description: `${productName} добавлен в корзину!`,
          });
        },
        onError: (error: any) => {
          toast.error('Ошибка', {
            description: error?.response?.data?.error || 'Не удалось добавить в корзину',
          });
        },
      }
    );
  };

  const renderProduct = ({ item: product }: { item: Product }) => (
    <TouchableOpacity
      className="bg-surface rounded-3xl overflow-hidden mb-3 border border-surface-gray"
      style={{ width: '48%' }}
      activeOpacity={0.8}
      onPress={() => router.push(`/product/${product._id}` as any)}
    >
      <View className="relative">
        <Image
          source={{ uri: product.images[0] }}
          className="w-full h-44 bg-surface-gray"
          resizeMode="cover"
        />

        <TouchableOpacity
          className="absolute top-3 right-3 bg-white/80 p-2 rounded-full shadow-sm"
          activeOpacity={0.7}
          onPress={() => toggleWishlist(product._id)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
        >
          {isAddingToWishlist || isRemovingFromWishlist ? (
            <ActivityIndicator size="small" color="#87e4ab" />
          ) : (
            <Ionicons
              name={isInWishlist(product._id) ? 'heart' : 'heart-outline'}
              size={18}
              color={isInWishlist(product._id) ? '#EF4444' : '#6B7280'}
            />
          )}
        </TouchableOpacity>
      </View>

      <View className="p-3">
        {/* Вместо категории показываем концентрацию (как просили) */}
        <Text className="text-text-secondary text-xs mb-1 font-inter-medium" numberOfLines={1}>
          {product.concentration}
        </Text>
        <Text className="text-text-primary font-raleway-bold text-sm mb-2 h-10" numberOfLines={2}>
          {product.name}
        </Text>

        <View className="flex-row items-center mb-2">
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text className="text-text-primary text-xs font-inter-bold ml-1">
            {product.averageRating.toFixed(1)}
          </Text>
          <Text className="text-text-secondary text-xs ml-1 font-inter-regular">
            ({product.totalReviews})
          </Text>
        </View>

        <View className="flex-row items-center justify-between mt-1">
          {/* Цена: 13 500 ₽ */}
          <Text className="text-primary font-inter-bold text-lg">{formatPrice(product.price)}</Text>

          <TouchableOpacity
            className="bg-primary rounded-full w-8 h-8 items-center justify-center shadow-sm shadow-primary/30"
            activeOpacity={0.7}
            onPress={() => handleAddToCart(product._id, product.name)}
            disabled={isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="add" size={20} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View className="py-20 items-center justify-center">
        <ActivityIndicator size="large" color="#87e4ab" />
        <Text className="text-text-secondary mt-4 font-inter-medium">Загрузка товаров...</Text>
      </View>
    );
  }

  // Защита от undefined products
  if (isError || !products) {
    return (
      <View className="py-20 items-center justify-center">
        <Ionicons name="cloud-offline-outline" size={48} color="#EF4444" />
        <Text className="text-text-primary font-raleway-bold mt-4">
          Не удалось загрузить товары
        </Text>
        <Text className="text-text-secondary text-sm mt-2 font-inter-medium text-center px-10">
          Проверьте соединение с интернетом или повторите попытку позже
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={{ justifyContent: 'space-between' }}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
      ListEmptyComponent={NoProductsFound}
    />
  );
};

export default ProductsGrid;

function NoProductsFound() {
  return (
    <View className="py-20 items-center justify-center">
      <Ionicons name="search-outline" size={48} color={'#9CA3AF'} />
      <Text className="text-text-primary font-raleway-bold mt-4">Товары не найдены</Text>
      <Text className="text-text-secondary text-sm mt-2 font-inter-medium">
        Попробуйте изменить параметры поиска
      </Text>
    </View>
  );
}
