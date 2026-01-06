import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

import ProductsGrid from '@/components/ProductsGrid';
import SafeScreen from '@/components/SafeScreen';
import useProducts from '@/hooks/useProducts';
import { getDeclension } from '@/lib/utils';

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

  const { data: products, isLoading, isError } = useProducts();

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = products;

    // --- ФИЛЬТРАЦИЯ ---
    if (selectedCategory !== 'All') {
      if (selectedCategory === 'Female') {
        filtered = filtered.filter((p) => p.gender === 'Женский');
      } else if (selectedCategory === 'Male') {
        filtered = filtered.filter((p) => p.gender === 'Мужской');
      } else if (selectedCategory === 'Unisex') {
        filtered = filtered.filter((p) => p.gender === 'Унисекс');
      } else if (selectedCategory === 'Toilette') {
        filtered = filtered.filter((p) => p.concentration === 'Туалетная вода');
      } else if (selectedCategory === 'Parfum') {
        filtered = filtered.filter(
          (p) => p.concentration === 'Духи' || p.concentration === 'Парфюмерная вода'
        );
      }
    }

    // Фильтрация по поиску
    if (searchQuery.trim()) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const countText = getDeclension(filteredProducts.length, ['товар', 'товара', 'товаров']);

  return (
    <SafeScreen>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pb-4 pt-6">
          <View className="flex-row items-center justify-between mb-6">
            <View>
              <Text className="text-text-primary text-3xl font-raleway-bold tracking-tight">
                Каталог
              </Text>
            </View>

            <TouchableOpacity
              className="bg-surface border border-surface-gray p-3 rounded-full shadow-sm"
              activeOpacity={0.7}
            >
              <Ionicons name="options-outline" size={22} color={'#111827'} />
            </TouchableOpacity>
          </View>

          <View className="bg-surface border border-surface-gray flex-row items-center px-5 py-4 rounded-2xl shadow-sm">
            <Ionicons color={'#9CA3AF'} size={22} name="search" />
            <TextInput
              placeholder="Найти аромат..."
              placeholderTextColor={'#9CA3AF'}
              className="flex-1 ml-3 text-base text-text-primary font-inter-medium"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View className="mb-6">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24, gap: 12 }}
          >
            {CATEGORIES.map((category) => {
              const isSelected = selectedCategory === category.name;
              return (
                <TouchableOpacity
                  key={category.name}
                  onPress={() => setSelectedCategory(category.name)}
                  className={`px-5 py-2.5 rounded-full border ${
                    isSelected ? 'bg-primary border-primary' : 'bg-surface border-surface-gray'
                  }`}
                >
                  <Text
                    className={`font-inter-bold text-sm ${
                      isSelected ? 'text-white' : 'text-text-secondary'
                    }`}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View className="px-6 mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-text-primary text-lg font-raleway-bold">Товары</Text>
            <Text className="text-text-secondary text-sm font-inter-medium">
              {filteredProducts.length} {countText}
            </Text>
          </View>

          <ProductsGrid products={filteredProducts} isLoading={isLoading} isError={isError} />
        </View>
      </ScrollView>
    </SafeScreen>
  );
};

export default ShopScreen;
