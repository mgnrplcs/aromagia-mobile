import { View, Text, ScrollView, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useMemo, useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { getDeclension } from '@/lib/utils';

import ProductsGrid from '@/components/ProductsGrid';
import SafeScreen from '@/components/SafeScreen';
import useProducts from '@/hooks/useProducts';
import useWishlist from '@/hooks/useWishlist';
import FilterModal, { SortOption, GenderOption } from '@/components/modals/FilterModal';

// --- Категории ---
const CATEGORIES = [
  { name: 'All', label: 'Все' },
  { name: 'Female', label: 'Женские' },
  { name: 'Male', label: 'Мужские' },
  { name: 'Unisex', label: 'Унисекс' },
  { name: 'Toilette', label: 'Туалетная вода' },
  { name: 'Parfum', label: 'Духи' },
];

const ShopScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const { data: products, isLoading, isError, refetch: refetchProducts } = useProducts();
  const { refetch: refetchWishlist } = useWishlist();

  const priceRange = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 50000 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('popular');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchProducts(), refetchWishlist()]);
    setRefreshing(false);
  }, [refetchProducts, refetchWishlist]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // 1. Фильтрация по категории (Табы)
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Female') filtered = filtered.filter((p) => p.gender === 'Женский');
      else if (selectedCategory === 'Male')
        filtered = filtered.filter((p) => p.gender === 'Мужской');
      else if (selectedCategory === 'Unisex')
        filtered = filtered.filter((p) => p.gender === 'Унисекс');
      else if (selectedCategory === 'Toilette')
        filtered = filtered.filter((p) => p.concentration === 'Туалетная вода');
      else if (selectedCategory === 'Parfum')
        filtered = filtered.filter(
          (p) => p.concentration === 'Духи' || p.concentration === 'Парфюмерная вода'
        );
    }

    // 2. Фильтрация по цене
    if (minPrice) filtered = filtered.filter((p) => p.price >= Number(minPrice));
    if (maxPrice) filtered = filtered.filter((p) => p.price <= Number(maxPrice));

    // 3. Сортировка
    if (sortOption === 'price_asc') filtered = filtered.sort((a, b) => a.price - b.price);
    else if (sortOption === 'price_desc') filtered = filtered.sort((a, b) => b.price - a.price);
    else if (sortOption === 'newest')
      filtered = filtered.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    // 4. Поиск
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, searchQuery, selectedCategory, sortOption, minPrice, maxPrice]);

  const itemsCount = filteredProducts.length;

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#87e4ab']}
            tintColor="#87e4ab"
            progressViewOffset={20}
          />
        }
      >
        <View className="px-6 pb-4 pt-2">
          {/* Шапка */}
          <View className="flex-row items-center justify-between mb-3.5">
            <Text className="text-black text-3xl font-raleway-semibold tracking-wide">Каталог</Text>
            {itemsCount > 0 && (
              <View className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                <Text className="text-primary text-sm tracking-wide font-inter-semibold">
                  {itemsCount} {getDeclension(itemsCount, ['товар', 'товара', 'товаров'])}
                </Text>
              </View>
            )}
          </View>

          {/* Поиск + Кнопка */}
          <View className="flex-row items-center">
            <View className="flex-1 flex-row items-center px-5 bg-gray-50 rounded-2xl border border-gray-200/80">
              <Ionicons color={'#cccccc'} size={20} name="search" />
              <TextInput
                placeholder="Найти товары..."
                placeholderTextColor={'#a3a5aa'}
                className="flex-1 ml-3 pb-3 text-base text-black tracking-wide font-inter"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              className="ml-3 w-[46px] h-[46px] bg-gray-50 border border-gray-200/80 rounded-2xl items-center justify-center active:bg-gray-100"
              onPress={() => setIsFilterVisible(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={22} color={'#111827'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Категории */}
        <View className="mb-5">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => setSelectedCategory(category.name)}
                  activeOpacity={0.8}
                  className={`px-4 py-2 rounded-xl border transition-all ${isSelected ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                >
                  <Text
                    className={`font-inter-medium tracking-wide text-sm ${isSelected ? 'text-white' : 'text-gray-500/80'}`}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="px-6 mb-6">
          <ProductsGrid
            products={filteredProducts}
            isLoading={isLoading}
            isError={isError}
            onRetry={onRefresh}
          />
        </View>
      </ScrollView>

      <FilterModal
        visible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        currentSort={sortOption}
        minPrice={minPrice}
        maxPrice={maxPrice}
        currentGender={
          ['Male', 'Female', 'Unisex'].includes(selectedCategory)
            ? (selectedCategory as GenderOption)
            : 'All'
        }
        absoluteMinPrice={priceRange.min}
        absoluteMaxPrice={priceRange.max}
        setSort={setSortOption}
        setMinPrice={setMinPrice}
        setMaxPrice={setMaxPrice}
        setGender={(gender) => {
          setSelectedCategory(gender === 'All' ? 'All' : gender);
        }}
      />
    </SafeScreen>
  );
};

export default ShopScreen;
