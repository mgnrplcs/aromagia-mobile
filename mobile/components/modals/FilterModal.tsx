import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Slider } from '@miblanchard/react-native-slider';

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'popular';
export type GenderOption = 'All' | 'Male' | 'Female' | 'Unisex';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  currentSort: SortOption;
  minPrice: string;
  maxPrice: string;
  currentGender: GenderOption;
  absoluteMinPrice: number;
  absoluteMaxPrice: number;

  setSort: (val: SortOption) => void;
  setMinPrice: (val: string) => void;
  setMaxPrice: (val: string) => void;
  setGender: (val: GenderOption) => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

// --- ХЕЛПЕРЫ ДЛЯ ЦЕНЫ ---
const formatNumber = (num: string | number) => {
  if (!num && num !== 0) return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const unformatNumber = (str: string) => {
  return str.replace(/\s/g, '');
};

export default function FilterModal({
  visible,
  onClose,
  currentSort,
  minPrice,
  maxPrice,
  currentGender,
  absoluteMinPrice = 0,
  absoluteMaxPrice = 10000,
  setSort,
  setMinPrice,
  setMaxPrice,
  setGender,
}: FilterModalProps) {
  const insets = useSafeAreaInsets();

  // --- АНИМАЦИЯ ---
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const closeModalAnimated = () => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(panY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      panY.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  // --- ЖЕСТЫ ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 150 || gestureState.vy > 0.5) {
          closeModalAnimated();
        } else {
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  // --- СБРОС ---
  const handleReset = () => {
    setSort('popular');
    setMinPrice('');
    setMaxPrice('');
    setGender('All');
  };

  // --- СЛАЙДЕР ---
  const handleSliderChange = (values: number[]) => {
    const [min, max] = values;
    setMinPrice(Math.floor(min).toString());
    setMaxPrice(Math.floor(max).toString());
  };

  const sliderMinValue = Number(unformatNumber(minPrice)) || absoluteMinPrice;
  const sliderMaxValue = Number(unformatNumber(maxPrice)) || absoluteMaxPrice;

  // Защита от ошибок
  const safeSliderValues = [
    Math.max(absoluteMinPrice, Math.min(sliderMinValue, sliderMaxValue)),
    Math.min(absoluteMaxPrice, Math.max(sliderMinValue, sliderMaxValue)),
  ];

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={closeModalAnimated}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        <Animated.View
          className="absolute top-0 bottom-0 left-0 right-0 bg-black/40"
          style={{ opacity }}
        >
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={closeModalAnimated} />
        </Animated.View>

        <Animated.View
          className="bg-white w-full overflow-hidden "
          style={{
            height: '64%',
            paddingBottom: insets.bottom,
            transform: [{ translateY: panY }],
          }}
        >
          <View {...panResponder.panHandlers} className="bg-white pb-1 w-full z-10">
            <View className="items-center pt-3">
              <View className="w-10 h-1 bg-gray-300 rounded-full opacity-80" />
            </View>

            <View className="px-6 mt-4 pb-1 flex-row items-center justify-between">
              <Text className="text-black text-2xl font-raleway-bold tracking-tight">Фильтры</Text>
              <TouchableOpacity
                onPress={closeModalAnimated}
                className="bg-gray-100 p-2 rounded-full active:bg-gray-200"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <View className="h-[1px] bg-gray-100 w-full mt-3" />
          </View>

          <ScrollView className="px-6 pt-5" showsVerticalScrollIndicator={false}>
            {/* 1. СОРТИРОВКА */}
            <View className="mb-5">
              <Text className="text-black font-inter-semibold text-[15px] mb-3">Сортировка</Text>
              <View className="flex-row flex-wrap gap-2.5">
                <SortChip
                  label="Популярное"
                  active={currentSort === 'popular'}
                  onPress={() => setSort('popular')}
                />
                <SortChip
                  label="Новинки"
                  active={currentSort === 'newest'}
                  onPress={() => setSort('newest')}
                />
                <SortChip
                  label="Сначала дешевле"
                  active={currentSort === 'price_asc'}
                  onPress={() => setSort('price_asc')}
                />
                <SortChip
                  label="Сначала дороже"
                  active={currentSort === 'price_desc'}
                  onPress={() => setSort('price_desc')}
                />
              </View>
            </View>

            {/* 2. ЦЕНА */}
            <View className="mb-5">
              <View className="flex-row justify-between items-end mb-1">
                <Text className="text-black font-inter-semibold text-[15px]">Цена, ₽</Text>
              </View>

              <View className="px-2 mb-3">
                <Slider
                  animateTransitions
                  minimumValue={absoluteMinPrice}
                  maximumValue={absoluteMaxPrice}
                  step={100}
                  value={safeSliderValues}
                  onValueChange={handleSliderChange}
                  minimumTrackTintColor="#000000"
                  maximumTrackTintColor="#000000"
                  thumbTintColor="#FFFFFF"
                  thumbStyle={styles.thumbStyle}
                  trackStyle={{ height: 7, borderRadius: 3 }}
                />
              </View>

              {/* Поля ввода */}
              <View className="flex-row items-center gap-3">
                <PriceInput
                  label="от"
                  value={minPrice}
                  placeholder={absoluteMinPrice.toString()}
                  onChangeText={setMinPrice}
                />
                <View className="w-4 h-[2px] bg-gray-200 rounded-full" />
                <PriceInput
                  label="до"
                  value={maxPrice}
                  placeholder={absoluteMaxPrice.toString()}
                  onChangeText={setMaxPrice}
                />
              </View>
            </View>

            {/* 3. ПОЛ */}
            <View>
              <Text className="text-black font-inter-semibold text-[15px] mb-2.5">Пол</Text>
              <View className="flex-row gap-2.5 flex-wrap">
                <SortChip
                  label="Все"
                  active={currentGender === 'All'}
                  onPress={() => setGender('All')}
                />
                <SortChip
                  label="Женский"
                  active={currentGender === 'Female'}
                  onPress={() => setGender('Female')}
                />
                <SortChip
                  label="Мужской"
                  active={currentGender === 'Male'}
                  onPress={() => setGender('Male')}
                />
                <SortChip
                  label="Унисекс"
                  active={currentGender === 'Unisex'}
                  onPress={() => setGender('Unisex')}
                />
              </View>
            </View>
          </ScrollView>

          {/* КНОПКА СБРОСИТЬ */}
          <View className="px-6 bg-white">
            <TouchableOpacity
              onPress={handleReset}
              activeOpacity={0.7}
              className="w-full bg-white border border-gray-200 py-3 rounded-2xl flex-row items-center justify-center shadow-sm shadow-gray-100"
            >
              <Text className="text-black font-inter-semibold text-[15px]">Сбросить фильтры</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function PriceInput({
  label,
  value,
  placeholder,
  onChangeText,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 h-12 flex-row items-center">
      <Text className="text-gray-400 mr-1.5 text-sm font-inter-medium pt-0.5">{label}</Text>
      <TextInput
        className="flex-1 font-inter-medium text-black text-[15px] p-0 m-0 leading-5 h-full"
        placeholder={formatNumber(placeholder)}
        placeholderTextColor="#000000"
        keyboardType="numeric"
        value={formatNumber(value)}
        onChangeText={(text) => onChangeText(unformatNumber(text))}
        textAlignVertical="center"
      />
    </View>
  );
}

function SortChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-5 py-2.5 rounded-xl border ${
        active ? 'bg-black border-black' : 'bg-white border-gray-200'
      }`}
    >
      <Text
        className={`font-inter-medium tracking-wide text-[13px] ${
          active ? 'text-white' : 'text-gray-500'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  thumbStyle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
});
