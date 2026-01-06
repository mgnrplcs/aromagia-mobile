import SafeScreen from '@/components/SafeScreen';
import useCart from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProduct';
import useWishlist from '@/hooks/useWishlist';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { toast } from 'sonner-native';

const { width } = Dimensions.get('window');

// Форматирование цены (Рубли, без копеек, безопасное)
const formatPrice = (price?: number) => {
  const safePrice = price || 0; // Защита от undefined
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(safePrice);
};

const ProductDetailScreen = () => {
  // 1. Хуки
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: product, isError, isLoading } = useProduct(id);
  const { addToCart, isAddingToCart } = useCart();
  const { isInWishlist, toggleWishlist, isAddingToWishlist, isRemovingFromWishlist } =
    useWishlist();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // 2. Логика
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(
      { productId: product._id, quantity },
      {
        onSuccess: () =>
          toast.success('Успешно', { description: `${product.name} добавлен в корзину!` }),
        onError: (error: any) => {
          toast.error('Ошибка', {
            description: error?.response?.data?.error || 'Не удалось добавить',
          });
        },
      }
    );
  };

  // 3. Загрузка и Ошибки
  if (isLoading) return <LoadingUI />;
  if (isError || !product) return <ErrorUI />;

  const inStock = (product.stock || 0) > 0;
  const images = product.images || [];
  // Безопасное получение рейтинга и цены
  const rating = product.averageRating || 0;
  const price = product.price || 0;

  return (
    <SafeScreen>
      {/* Шапка */}
      <View className="absolute top-0 left-0 right-0 z-10 px-6 pt-4 flex-row items-center justify-between">
        <TouchableOpacity
          className="bg-white/80 backdrop-blur-md w-10 h-10 rounded-full items-center justify-center shadow-sm"
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>

        <TouchableOpacity
          className={`w-10 h-10 rounded-full items-center justify-center shadow-sm ${
            isInWishlist(product._id) ? 'bg-white' : 'bg-white/80 backdrop-blur-md'
          }`}
          onPress={() => toggleWishlist(product._id)}
          disabled={isAddingToWishlist || isRemovingFromWishlist}
          activeOpacity={0.7}
        >
          {isAddingToWishlist || isRemovingFromWishlist ? (
            <ActivityIndicator size="small" color="#87e4ab" />
          ) : (
            <Ionicons
              name={isInWishlist(product._id) ? 'heart' : 'heart-outline'}
              size={24}
              color={isInWishlist(product._id) ? '#EF4444' : '#111827'}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1 bg-background"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Галерея */}
        <View className="relative">
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setSelectedImageIndex(index);
            }}
          >
            {images.length > 0 ? (
              images.map((image: string, index: number) => (
                <View key={index} style={{ width }}>
                  <Image source={image} style={{ width, height: 450 }} contentFit="cover" />
                </View>
              ))
            ) : (
              <View
                style={{ width, height: 450 }}
                className="bg-gray-100 items-center justify-center"
              >
                <Ionicons name="image-outline" size={64} color="#ccc" />
              </View>
            )}
          </ScrollView>

          {/* Индикаторы */}
          <View className="absolute bottom-4 left-0 right-0 flex-row justify-center gap-2">
            {images.map((_: any, index: number) => (
              <View
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === selectedImageIndex ? 'bg-primary w-6' : 'bg-white/50 w-1.5'
                }`}
              />
            ))}
          </View>
        </View>

        {/* Информация */}
        <View className="p-6 -mt-6 bg-background rounded-t-3xl shadow-sm">
          {/* Концентрация */}
          <View className="flex-row items-center mb-3">
            <View className="bg-primary/10 px-3 py-1 rounded-full">
              <Text className="text-primary text-xs font-inter-bold uppercase tracking-wide">
                {product.concentration || 'Аромат'}
              </Text>
            </View>
          </View>

          {/* Название */}
          <Text className="text-text-primary text-3xl font-raleway-bold mb-2">{product.name}</Text>

          {/* Рейтинг */}
          <View className="flex-row items-center mb-6">
            <Ionicons name="star" size={18} color="#F59E0B" />
            <Text className="text-text-primary font-inter-bold ml-1.5 mr-1 text-base">
              {/* Исправлено: безопасный вызов toFixed */}
              {rating.toFixed(1)}
            </Text>
            <Text className="text-text-secondary text-sm font-inter-medium">
              ({product.totalReviews || 0} отзывов) •
            </Text>
            {inStock ? (
              <Text className="text-primary font-inter-medium text-sm ml-1">В наличии</Text>
            ) : (
              <Text className="text-status-error font-inter-medium text-sm ml-1">
                Нет в наличии
              </Text>
            )}
          </View>

          {/* Описание */}
          <View className="mb-8">
            <Text className="text-text-primary text-lg font-raleway-bold mb-3">Описание</Text>
            <Text className="text-text-secondary text-base leading-6 font-inter-regular">
              {product.description || 'Описание отсутствует'}
            </Text>
          </View>

          {/* Выбор количества */}
          <View className="flex-row items-center justify-between p-4 bg-surface-gray rounded-2xl mb-4">
            <Text className="text-text-primary font-inter-bold text-base">Количество</Text>
            <View className="flex-row items-center gap-4">
              <TouchableOpacity
                className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm"
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={!inStock}
              >
                <Ionicons name="remove" size={18} color={inStock ? '#111827' : '#9CA3AF'} />
              </TouchableOpacity>

              <Text className="text-text-primary text-lg font-inter-bold min-w-[20px] text-center">
                {quantity}
              </Text>

              <TouchableOpacity
                className="w-8 h-8 bg-white rounded-full items-center justify-center shadow-sm"
                onPress={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                disabled={!inStock || quantity >= (product.stock || 0)}
              >
                <Ionicons name="add" size={18} color="#111827" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Нижняя панель */}
      <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-surface-gray px-6 py-4 pb-8 shadow-lg">
        <View className="flex-row items-center gap-4">
          <View className="flex-1">
            <Text className="text-text-secondary text-xs font-inter-medium mb-0.5">Итого</Text>
            {/* Форматированная цена */}
            <Text className="text-primary text-2xl font-raleway-bold">
              {formatPrice(price * quantity)}
            </Text>
          </View>
          <TouchableOpacity
            className={`flex-[2] rounded-2xl py-4 flex-row items-center justify-center shadow-md shadow-primary/20 ${
              !inStock ? 'bg-surface-gray' : 'bg-primary'
            }`}
            activeOpacity={0.8}
            onPress={handleAddToCart}
            disabled={!inStock || isAddingToCart}
          >
            {isAddingToCart ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="bag-handle" size={20} color={!inStock ? '#9CA3AF' : '#FFFFFF'} />
                <Text
                  className={`font-inter-bold text-base ml-2 ${
                    !inStock ? 'text-text-secondary' : 'text-white'
                  }`}
                >
                  {!inStock ? 'Нет в наличии' : 'В корзину'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeScreen>
  );
};

export default ProductDetailScreen;

function ErrorUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center px-6">
        <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
        <Text className="text-text-primary font-raleway-bold text-xl mt-4">Товар не найден</Text>
        <Text className="text-text-secondary text-center mt-2 font-inter-medium">
          Возможно, он был удален или произошла ошибка
        </Text>
        <TouchableOpacity
          className="bg-primary rounded-2xl px-6 py-3 mt-6"
          onPress={() => router.back()}
        >
          <Text className="text-white font-inter-bold">Вернуться назад</Text>
        </TouchableOpacity>
      </View>
    </SafeScreen>
  );
}

function LoadingUI() {
  return (
    <SafeScreen>
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#87e4ab" />
      </View>
    </SafeScreen>
  );
}
