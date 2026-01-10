import PageLoader from '@/components/PageLoader';
import useCart from '@/hooks/useCart';
import { useUser } from '@clerk/clerk-expo';
import { useReviews } from '@/hooks/useReviews';
import { useProduct } from '@/hooks/useProduct';
import useWishlist from '@/hooks/useWishlist';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  LayoutAnimation,
  StyleSheet,
  Animated,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Brand, Product, Review, User } from '@/types';
import { formatPrice, getDeclension, formatDate } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = 440;

const ProductDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  const { data: product, isError, isLoading } = useProduct(id);
  const { data: recommendations } = useRecommendations(id);

  const [selectedVolume, setSelectedVolume] = useState<number | null>(null);

  // Список всех доступных объемов
  const allVolumes = useMemo(() => {
    if (!product) return [];
    if (product.variants && product.variants.length > 0) {
      return product.variants.map((v) => v.volume).sort((a, b) => a - b);
    }
    return [product.volume];
  }, [product]);

  useEffect(() => {
    if (allVolumes.length > 0 && selectedVolume === null) {
      setSelectedVolume(allVolumes[0]);
    }
  }, [allVolumes]);

  if (isLoading) return <PageLoader />;
  if (isError || !product) return <ErrorUI />;

  const brand = typeof product.brand === 'object' ? (product.brand as Brand) : null;

  const currentVariant = product.variants?.find((v) => v.volume === selectedVolume);
  const displayPrice = currentVariant ? currentVariant.price : product.price;
  const currentStock = currentVariant ? currentVariant.stock : product.stock;

  return (
    <View className="flex-1 bg-white relative">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 90 }}
        bounces={false}
      >
        <ProductGallery images={product.images} />
        <ProductInfo
          product={product}
          brand={brand}
          selectedVolume={selectedVolume}
          setSelectedVolume={setSelectedVolume}
          allVolumes={allVolumes}
        />

        <SwipeableProductTabs product={product} brand={brand} />

        <ProductReviews productId={product._id} count={product.totalReviews} />

        <RecommendationsList items={recommendations} />
      </ScrollView>

      <ProductHeader product={product} insets={insets} />
      <ProductBottomBar
        product={product}
        insets={insets}
        selectedVolume={selectedVolume}
        price={displayPrice}
        stock={currentStock}
      />
    </View>
  );
};

const ProductHeader = ({ product, insets }: { product: Product; insets: any }) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isInListServer = isInWishlist(product._id);
  const [isLiked, setIsLiked] = useState(isInListServer);

  useEffect(() => {
    setIsLiked(isInListServer);
  }, [isInListServer]);

  const handleWishlistPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsLiked((prev) => !prev);
    toggleWishlist(product._id);
  };

  return (
    <View
      className="absolute top-0 left-0 right-0 z-50 px-6 flex-row items-center justify-between pointer-events-box-none"
      style={{ paddingTop: insets.top + 10 }}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center border border-gray-100 active:bg-gray-200"
      >
        <Ionicons name="arrow-back" size={22} color="#111827" />
      </TouchableOpacity>

      <TouchableOpacity
        className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center border border-gray-100 active:bg-gray-200"
        onPress={handleWishlistPress}
        activeOpacity={0.7}
      >
        <Ionicons
          name={isLiked ? 'heart' : 'heart-outline'}
          size={22}
          color={isLiked ? '#EF4444' : '#111827'}
        />
      </TouchableOpacity>
    </View>
  );
};

// Галерея
const ProductGallery = ({ images }: { images: string[] }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [selectedImageIndex]);

  return (
    <View style={styles.galleryContainer}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          if (index !== selectedImageIndex) setSelectedImageIndex(index);
        }}
        scrollEventThrottle={16}
      >
        {images.map((img, index) => (
          <View key={index} style={[styles.galleryImageWrapper, { width, height: IMAGE_HEIGHT }]}>
            <Image source={img} style={{ width: width, height: '100%' }} contentFit="cover" />
          </View>
        ))}
      </ScrollView>

      {images.length > 1 && (
        <View style={styles.indicatorWrapper}>
          <View style={styles.glassCapsule}>
            {images.map((_, index) => (
              <AnimatedDot key={index} isActive={index === selectedImageIndex} />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

// 2. Информация
const ProductInfo = ({
  product,
  brand,
  selectedVolume,
  setSelectedVolume,
  allVolumes,
}: {
  product: Product;
  brand: Brand | null;
  selectedVolume: number | null;
  setSelectedVolume: (v: number) => void;
  allVolumes: number[];
}) => (
  <View className="px-6 pt-5">
    <Text className="text-black font-raleway-bold text-lg mb-0.5 uppercase tracking-widest">
      {brand?.name}
    </Text>
    <Text className="text-black text-2xl font-raleway-medium mb-2 tracking-wide">
      {product.name}
    </Text>
    <View className="flex-row items-center mb-5">
      <View className="flex-row gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={i <= Math.round(product.averageRating || 0) ? 'star' : 'star-outline'}
            size={18}
            color="#000000"
          />
        ))}
      </View>
      <Text className="text-black font-inter tracking-wider text-sm ml-2.5">
        {product.totalReviews} {getDeclension(product.totalReviews, ['отзыв', 'отзыва', 'отзывов'])}
      </Text>
    </View>

    {/* Выбор объема */}
    <View className="mb-3">
      <Text className="text-black font-inter-bold text-sm uppercase tracking-widest mb-2">
        Выберите объем
      </Text>
      <View className="flex-row flex-wrap gap-2.5">
        {allVolumes.map((vol) => {
          const isSelected = selectedVolume === vol;
          return (
            <TouchableOpacity
              key={vol}
              onPress={() => setSelectedVolume(vol)}
              activeOpacity={0.7}
              className={`px-4 py-2 rounded-xl border transition-all ${
                isSelected ? 'border-black bg-white' : 'border-gray-200 bg-gray-50'
              }`}
            >
              <Text
                className={`font-inter-semibold text-sm ${isSelected ? 'text-black' : 'text-gray-400'}`}
              >
                {vol} мл
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>

    <Text className="text-black text-[15px] leading-7 font-raleway pb-5 mt-1">
      {product.description}
    </Text>
  </View>
);

// 3. Табы
const SwipeableProductTabs = ({ product, brand }: { product: Product; brand: Brand | null }) => {
  const [activeTab, setActiveTab] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const [showAllFeatures, setShowAllFeatures] = useState(false);

  const allFeatures = useMemo(() => {
    const list = [];
    if (product.concentration) list.push({ label: 'Тип продукта', value: product.concentration });
    if (product.gender) list.push({ label: 'Пол', value: product.gender });
    if (product.scentFamily) list.push({ label: 'Группа', value: product.scentFamily });
    if (product.notesPyramid?.top)
      list.push({ label: 'Верхние ноты', value: product.notesPyramid.top });
    if (product.notesPyramid?.middle)
      list.push({ label: 'Ноты сердца', value: product.notesPyramid.middle });
    if (product.notesPyramid?.base)
      list.push({ label: 'Базовые ноты', value: product.notesPyramid.base });
    if (product.country) list.push({ label: 'Страна', value: product.country });
    if (product.article) list.push({ label: 'Артикул', value: product.article });
    return list;
  }, [product]);

  const displayedFeatures = showAllFeatures ? allFeatures : allFeatures.slice(0, 4);

  const handleTabPress = (index: number) => {
    setActiveTab(index);
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / width);
    if (slide !== activeTab) setActiveTab(slide);
  };

  return (
    <View>
      {/* Заголовки табов */}
      <View className="px-4 border-b border-gray-100 mb-5 flex-row">
        <TabButton active={activeTab === 0} label="О товаре" onPress={() => handleTabPress(0)} />
        <TabButton active={activeTab === 1} label="Состав" onPress={() => handleTabPress(1)} />
        <TabButton active={activeTab === 2} label="О бренде" onPress={() => handleTabPress(2)} />
      </View>

      {/* Контент */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Слайд 1: Характеристики */}
        <View style={{ width: width }} className="px-6 pb-4">
          <View className="gap-3">
            {displayedFeatures.map((feat, idx) => (
              <FeatureRow key={idx} label={feat.label} value={feat.value} />
            ))}
          </View>

          {!showAllFeatures && allFeatures.length > 4 && (
            <TouchableOpacity
              onPress={() => setShowAllFeatures(true)}
              className="mt-4 py-3 items-center border border-gray-200 rounded-xl"
            >
              <Text className="text-black font-inter-medium tracking-wide text-base">
                Показать все характеристики
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Слайд 2: Состав */}
        <View style={{ width: width }} className="px-6 pb-4">
          <Text className="text-black font-inter leading-7 text-base">{product.ingredients}</Text>
        </View>

        {/* Слайд 3: Бренд */}
        <View style={{ width: width }} className="px-6 pb-2">
          <View className="flex-row items-center">
            {brand?.logo && (
              <Image
                source={brand.logo}
                style={{ width: 80, height: 80, borderRadius: 40 }}
                contentFit="contain"
                className="bg-gray-50 border border-gray-100"
              />
            )}
            <View className="ml-4">
              <Text className="text-xl font-raleway-semibold tracking-wide text-black">
                {brand?.name}
              </Text>
              <Text className="text-black text-sm uppercase font-raleway-medium tracking-widest">
                Официальный представитель
              </Text>
            </View>
          </View>
          <Text className="text-black font-inter leading-6 text-[15px] pr-6">
            {brand?.description}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// 5. Блок отзывов
const ProductReviews = ({ productId, count }: { productId: string; count: number }) => {
  const api = useApi();
  const { user: currentUser } = useUser();
  const { deleteReviewAsync, isDeletingReview } = useReviews();

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data } = await api.get<{ reviews: Review[] }>(`/reviews/product/${productId}`);
      return data.reviews;
    },
  });

  const handleDeleteReview = (reviewId: string) => {
    Alert.alert('Удалить отзыв?', 'Это действие нельзя будет отменить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReviewAsync(reviewId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (error) {
            Alert.alert('Ошибка', 'Не удалось удалить отзыв');
          }
        },
      },
    ]);
  };

  return (
    <View className="pt-3 px-6">
      {/* Заголовок */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-xl font-inter-bold text-black">Отзывы ({count})</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color="#000" />
      ) : !reviews || reviews.length === 0 ? (
        <View className="bg-gray-50 rounded-2xl p-6 items-center border border-gray-200 border-dashed">
          <Ionicons name="chatbubbles-outline" size={35} color="#9CA3AF" />
          <Text className="text-gray-500 font-raleway mt-1.5 text-center text-base">
            Отзывов пока нет. Будьте первым!
          </Text>
        </View>
      ) : (
        <View className="gap-5">
          {reviews.slice(0, 3).map((review) => {
            const user = review.userId as User;
            const isMyReview = currentUser?.id === user?.clerkId;

            return (
              <View key={review._id} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                {/* Шапка отзыва: Аватар, Имя, Дата */}
                <View className="flex-row items-center mb-1.5">
                  <View className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden mr-3 border border-white">
                    {user?.imageUrl ? (
                      <Image
                        key={user.imageUrl}
                        source={{ uri: user.imageUrl }}
                        style={{ width: '100%', height: '100%' }}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                      />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Ionicons name="person" size={20} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-black font-inter-semibold text-base tracking-wide">
                      {user?.firstName} {user?.lastName}
                    </Text>
                    <Text className="text-gray-500/70 font-inter text-sm">
                      {formatDate(review.createdAt)}
                    </Text>
                  </View>

                  {isMyReview && (
                    <TouchableOpacity
                      onPress={() => handleDeleteReview(review._id)}
                      disabled={isDeletingReview}
                      className="w-7 h-7 -mt-2 items-center justify-center rounded-full active:bg-red-50"
                    >
                      <Ionicons name="trash-outline" size={18} color="#ccc" />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Рейтинг */}
                <View className="flex-row gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name={star <= review.rating ? 'star' : 'star-outline'}
                      size={14}
                      color="#000000"
                    />
                  ))}
                </View>

                {/* Комментарий */}
                {review.comment ? (
                  <Text className="text-black font-inter leading-6 text-base">
                    {review.comment}
                  </Text>
                ) : null}
              </View>
            );
          })}

          {/* Кнопка "Показать больше" */}
          {reviews.length > 3 && (
            <TouchableOpacity className="items-center py-2">
              <Text className="text-black font-inter-semibold text-sm underline">
                Смотреть все отзывы
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

// 6. Нижняя панель
const ProductBottomBar = ({
  product,
  insets,
  selectedVolume,
  price,
  stock,
}: {
  product: Product;
  insets: any;
  selectedVolume: number | null;
  price: number;
  stock: number;
}) => {
  const {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    isAddingToCart,
    isUpdating,
    isRemoving,
  } = useCart();

  const inStock = stock > 0;

  const cartItem = cart?.items.find(
    (item) =>
      (typeof item.product === 'string' ? item.product : item.product._id) === product._id &&
      item.volume === selectedVolume
  );
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    if (selectedVolume) {
      addToCart({ productId: product._id, quantity: 1, volume: selectedVolume });
    }
  };

  const handleIncrease = () => {
    if (selectedVolume) {
      updateQuantity({
        productId: product._id,
        quantity: quantityInCart + 1,
        volume: selectedVolume,
      });
    }
  };

  const handleDecrease = () => {
    if (quantityInCart === 1) {
      if (selectedVolume) removeFromCart({ productId: product._id, volume: selectedVolume });
    } else if (selectedVolume) {
      updateQuantity({
        productId: product._id,
        quantity: quantityInCart - 1,
        volume: selectedVolume,
      });
    }
  };

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50"
      style={{ paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }}
    >
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[#111827] text-2xl font-inter-bold">{formatPrice(price)}</Text>
        </View>

        <View className="flex-1 ml-4 max-w-[240px]">
          {!cartItem ? (
            <TouchableOpacity
              className="flex-row items-center justify-center h-12 shadow-sm active:opacity-90 rounded-2xl"
              style={{ backgroundColor: !inStock ? '#E5E7EB' : '#3B82F6' }}
              activeOpacity={0.8}
              onPress={handleAddToCart}
              disabled={!inStock || isAddingToCart}
            >
              {isAddingToCart ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Ionicons name="bag-handle" size={20} color={!inStock ? '#9CA3AF' : '#FFF'} />
                  <Text
                    className={`font-inter-bold text-[15px] ml-2 ${!inStock ? 'text-gray-500' : 'text-white'}`}
                  >
                    {!inStock ? 'Нет в наличии' : 'В корзину'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            // Кнопка в корзине (Синяя слева | Белая справа)
            <View className="flex-row h-12 shadow-sm rounded-2xl overflow-hidden border border-gray-200 bg-white">
              {/* Левая часть: Синяя */}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/cart')}
                className="flex-1 items-center justify-center flex-row bg-blue-500"
              >
                <Ionicons name="bag-handle" size={20} color={!inStock ? '#9CA3AF' : '#FFF'} />
                <Ionicons
                  name="caret-back-outline"
                  size={20}
                  color={!inStock ? '#9CA3AF' : '#FFF'}
                />
              </TouchableOpacity>

              {/* Правая часть: Белая со счетчиком */}
              <View className="flex-row items-center px-3 gap-3 bg-white border-l border-gray-100">
                <TouchableOpacity
                  onPress={handleDecrease}
                  disabled={isUpdating || isRemoving}
                  className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center border border-gray-200 active:bg-gray-100"
                >
                  {isRemoving ? (
                    <ActivityIndicator size="small" color="#111827" />
                  ) : (
                    <Ionicons name="remove" size={18} color="#111827" />
                  )}
                </TouchableOpacity>

                <Text className="text-[#111827] font-inter-bold text-[16px] min-w-[20px] text-center">
                  {isUpdating ? <ActivityIndicator size="small" color="#111827" /> : quantityInCart}
                </Text>

                <TouchableOpacity
                  onPress={handleIncrease}
                  disabled={isUpdating || quantityInCart >= product.stock}
                  className="w-8 h-8 bg-gray-50 rounded-full items-center justify-center border border-gray-200 active:bg-gray-100"
                >
                  <Ionicons name="add" size={18} color="#111827" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const RecommendationsList = ({ items }: { items: Product[] | undefined }) => {
  if (!items || items.length === 0) return null;
  return (
    <View className="mt-4 pt-4 bg-white">
      <Text className="text-xl font-raleway-bold text-black px-6 mb-4">Вам может понравиться</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
      >
        {items.map((rec) => {
          const brandName = typeof rec.brand === 'object' ? rec.brand.name : 'Бренд';

          const getPriceDisplay = () => {
            if (rec.variants && rec.variants.length > 0) {
              const prices = rec.variants.map((v) => v.price);
              const min = Math.min(...prices);
              const max = Math.max(...prices);
              if (min === max) return formatPrice(min);
              return `${formatPrice(min)} – ${formatPrice(max)}`;
            }
            return formatPrice(rec.price);
          };

          // Получение списка объемов
          const volumes =
            rec.variants && rec.variants.length > 0
              ? rec.variants.map((v) => v.volume).sort((a, b) => a - b)
              : [rec.volume];

          return (
            <TouchableOpacity
              key={rec._id}
              style={{ width: 180 }}
              className="mr-4 bg-white"
              onPress={() => router.push(`/product/${rec._id}` as any)}
              activeOpacity={0.8}
            >
              <View className="bg-[#F3F4F6] rounded-[20px] mb-3 overflow-hidden h-[220px] items-center justify-center relative">
                <Image
                  source={rec.images[0]}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                />
              </View>
              <View className="px-1">
                <Text
                  numberOfLines={1}
                  className="font-raleway-bold text-black text-sm uppercase tracking-widest"
                >
                  {brandName}
                </Text>
                <Text
                  numberOfLines={1}
                  className="font-raleway-medium text-black text-[15px] tracking-wide -mt-0.5 mb-1.5"
                >
                  {rec.name}
                </Text>

                <View className="h-9">
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingRight: 20 }}
                    style={{ width: '100%', overflow: 'visible' }}
                  >
                    {volumes.map((vol) => (
                      <View
                        key={vol}
                        className="bg-white border border-black px-2 py-1 rounded-md self-start mr-1"
                      >
                        <Text className="text-[9px] font-inter-semibold text-black uppercase">
                          {vol} мл
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>

                <Text className="font-inter-semibold text-black text-lg">{getPriceDisplay()}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

// === Вспомогательные элементы ===

// Кнопка таба
const TabButton = ({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={1}
    className={`pb-2.5 border-b-2 px-1 flex-1 items-center ${active ? 'border-black' : 'border-transparent'}`}
  >
    <Text
      className={`font-raleway-bold text-base uppercase tracking-widest ${active ? 'text-black' : 'text-[#cccccc]'}`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const FeatureRow = ({ label, value }: { label: string; value?: string }) => (
  <View className="flex-row items-end justify-between mb-2">
    <Text className="text-gray-600 tracking-wide font-inter-light text-[14px] bg-white pr-1 z-10">
      {label}
    </Text>
    <View className="flex-1 overflow-hidden relative top-[3px]">
      <Text className="text-gray-300 tracking-[2px]" numberOfLines={1} ellipsizeMode="clip">
        ......................................................................
      </Text>
    </View>
    <Text className="text-black tracking-wide font-inter text-[14px] bg-white pl-1 z-10 text-right max-w-[80%]">
      {value || '—'}
    </Text>
  </View>
);

const ErrorUI = () => (
  <View className="flex-1 bg-white items-center justify-center px-6">
    <Text className="text-xl font-bold mb-4">Товар не найден</Text>
    <TouchableOpacity onPress={() => router.back()} className="bg-black px-6 py-3 rounded-xl">
      <Text className="text-white">Назад</Text>
    </TouchableOpacity>
  </View>
);

const AnimatedDot = ({ isActive }: { isActive: boolean }) => {
  const anim = useRef(new Animated.Value(isActive ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(anim, {
      toValue: isActive ? 1 : 0,
      useNativeDriver: false,
      tension: 70,
      friction: 8,
    }).start();
  }, [isActive]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: [6, 20] });
  const backgroundColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 255, 1)'],
  });
  return <Animated.View style={[styles.dot, { width, backgroundColor }]} />;
};

const styles = StyleSheet.create({
  galleryContainer: { height: IMAGE_HEIGHT, position: 'relative', backgroundColor: '#F3F4F6' },
  galleryImageWrapper: { alignItems: 'center', justifyContent: 'center' },
  indicatorWrapper: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
    elevation: 10,
  },
  glassCapsule: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dot: { height: 6, borderRadius: 999 },
});

export default ProductDetailScreen;
