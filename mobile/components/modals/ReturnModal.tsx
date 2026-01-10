import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Animated,
  PanResponder,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Order, Product } from '@/types';
import { useReturns } from '@/hooks/useReturns';
import * as ImagePicker from 'expo-image-picker';

const REASON_OPTIONS = ['Товар поврежден', 'Не тот товар', 'Больше не нужен', 'Другое'];

interface ReturnModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function ReturnModal({ visible, onClose, order }: ReturnModalProps) {
  const insets = useSafeAreaInsets();
  const { createReturnAsync, isCreatingReturn } = useReturns();

  const [selectedReason, setSelectedReason] = useState<string>('');
  const [details, setDetails] = useState('');
  const [images, setImages] = useState<ImagePicker.ImagePickerResult[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [itemsToReturnIds, setItemsToReturnIds] = useState<Set<string>>(new Set());

  // --- Анимация ---
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
    ]).start(() => {
      onClose();
      setTimeout(() => {
        setSelectedReason('');
        setDetails('');
        setImages([]);
        setSelectedImages([]);
        setItemsToReturnIds(new Set());
      }, 100);
    });
  };

  // --- Изображения ---
  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Ошибка', 'Нужен доступ к галерее для выбора фото');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImages((prev) => [...prev, result]);
      const newUris = result.assets.map((a) => a.uri);
      setSelectedImages((prev) => [...prev, ...newUris]);
    }
  };

  const removeImage = (uri: string) => {
    setSelectedImages((prev) => prev.filter((u) => u !== uri));
    setImages((prev) => prev.filter((res) => !res.assets?.some((a) => a.uri === uri)));
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

  // --- Жесты ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 0 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
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

  // --- Логика выбора ---
  const toggleItemSelection = (itemId: string) => {
    setItemsToReturnIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (itemsToReturnIds.size === 0) {
      Alert.alert('Ошибка', 'Выберите хотя бы один товар для возврата');
      return;
    }
    if (!selectedReason) {
      Alert.alert('Ошибка', 'Выберите причину возврата');
      return;
    }

    if (!order) return;

    try {
      const itemsToReturn = Array.from(itemsToReturnIds).map((id) => {
        const item = order.orderItems.find((oi) => (oi._id || (oi.product as Product)._id) === id);
        return {
          product:
            typeof item?.product === 'object' ? (item.product as Product)._id : item?.product,
          quantity: item?.quantity || 1,
        };
      });

      // Подготовка изображений для хука
      const imageAssets = images.flatMap((res) => res.assets || []);

      await createReturnAsync({
        orderId: order._id,
        reason: selectedReason,
        details: details.trim(),
        items: JSON.stringify(itemsToReturn),
        images: imageAssets,
      });

      Alert.alert('Успех', 'Заявка на возврат успешно отправлена. Наш менеджер свяжется с вами.');
      closeModalAnimated();
    } catch (error: any) {
      console.error('Ошибка при создании возврата:', error);
      Alert.alert(
        'Ошибка',
        error?.response?.data?.error || 'Не удалось отправить заявку на возврат'
      );
    }
  };

  if (!order) return null;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={closeModalAnimated}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        {/* Затемнение */}
        <Animated.View
          className="absolute top-0 bottom-0 left-0 right-0 bg-black/50"
          style={{ opacity }}
        >
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={closeModalAnimated} />
        </Animated.View>

        {/* Шторка */}
        <Animated.View
          className="bg-white w-full overflow-hidden"
          style={{
            height: '70%',
            transform: [{ translateY: panY }],
          }}
        >
          {/* Хедер */}
          <View {...panResponder.panHandlers} className="bg-white pb-2 w-full z-10 pt-4">
            <View className="items-center">
              <View className="w-10 h-1 bg-gray-300 rounded-full opacity-80" />
            </View>

            <View className="px-6 mt-4 flex-row items-center justify-between">
              <View>
                <Text className="text-black text-2xl font-raleway-bold tracking-tight">
                  Возврат товара
                </Text>
                <Text className="text-gray-500 font-inter text-sm mt-1">
                  Заказ №{order._id.slice(-6).toUpperCase()}
                </Text>
              </View>

              <TouchableOpacity
                onPress={closeModalAnimated}
                className="bg-gray-100 p-2 rounded-full active:bg-gray-200"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <View className="h-[1px] bg-gray-100 w-full mt-4" />
          </View>

          {/* Контент */}
          <ScrollView
            className="flex-1 px-6 pt-3"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Список товаров */}
            <Text className="text-black font-inter-semibold text-[15px] mb-2">
              Выберите товары для возврата
            </Text>
            <View className="gap-3 mb-6">
              {order.orderItems.map((item) => {
                const product = item.product as Product;
                const isSelected = itemsToReturnIds.has(item._id || product._id);
                const brandName =
                  item.brand || (typeof product.brand === 'object' ? product.brand.name : 'Бренд');
                const imageSource = product.images?.[0];

                return (
                  <TouchableOpacity
                    key={item._id}
                    onPress={() => toggleItemSelection(item._id || product._id)}
                    activeOpacity={0.8}
                    className={`flex-row items-center p-3 rounded-2xl border transition-all ${
                      isSelected ? 'bg-gray-50 border-black/10' : 'bg-white border-gray-100'
                    }`}
                  >
                    {/* Фото */}
                    <View className="bg-white rounded-xl  p-1 mr-3 h-14 w-14 items-center justify-center">
                      {imageSource ? (
                        <Image
                          source={imageSource}
                          style={{ width: '100%', height: '100%' }}
                          contentFit="contain"
                        />
                      ) : (
                        <Ionicons name="cube-outline" size={20} color="#E5E7EB" />
                      )}
                    </View>

                    {/* Текст */}
                    <View className="flex-1 pr-3">
                      <Text
                        className="text-black text-sm font-raleway-bold uppercase tracking-widest mb-0.5"
                        numberOfLines={1}
                      >
                        {brandName}
                      </Text>
                      <Text
                        className="text-black font-raleway-medium text-base leading-4 mb-1.5"
                        numberOfLines={1}
                      >
                        {item.name}
                      </Text>
                      {item.volume || product.volume ? (
                        <View className="bg-white border border-gray-300 px-2 py-[2px] rounded-[5px] self-start">
                          <Text className="text-[9px] font-inter-semibold text-black/90 uppercase">
                            {item.volume || product.volume} мл
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Радио-кнопка */}
                    <View
                      className={`w-6 h-6 rounded-full border items-center justify-center ${
                        isSelected ? 'bg-black border-black' : 'bg-transparent border-gray-300'
                      }`}
                    >
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Выбор причины */}
            <View className="mb-6">
              <Text className="text-black font-inter-semibold text-[15px] mb-2">
                Причина возврата
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {REASON_OPTIONS.map((opt) => {
                  const isSelected = selectedReason === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setSelectedReason(opt)}
                      className={`px-4 py-2 rounded-xl border ${
                        isSelected ? 'bg-black border-black' : 'bg-white border-gray-200'
                      }`}
                    >
                      <Text
                        className={`font-inter-medium text-sm ${isSelected ? 'text-white' : 'text-gray-500/80'}`}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Подробности */}
            <View className="mb-4">
              <Text className="text-black font-inter-semibold text-[15px] mb-2">Подробности</Text>
              <TextInput
                className="bg-white border border-gray-200 rounded-xl p-3.5 font-inter text-[13px] tracking-wide h-24 text-black shadow-sm shadow-gray-100"
                placeholder="Опишите проблему подробнее..."
                placeholderTextColor="#9a9a9a"
                multiline
                textAlignVertical="top"
                value={details}
                onChangeText={setDetails}
              />
            </View>

            {/* Фотографии */}
            <View className="mb-3">
              <Text className="text-black font-inter-semibold text-[15px] mb-3">
                Фотографии (по желанию)
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {selectedImages.map((uri) => (
                  <View
                    key={uri}
                    className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100"
                  >
                    <Image
                      source={uri}
                      style={{ width: '100%', height: '100%' }}
                      contentFit="cover"
                    />
                    <TouchableOpacity
                      onPress={() => removeImage(uri)}
                      className="absolute top-1 right-1 bg-black/50 w-5 h-5 rounded-full items-center justify-center"
                    >
                      <Ionicons name="close" size={14} color="white" />
                    </TouchableOpacity>
                  </View>
                ))}
                <TouchableOpacity
                  onPress={pickImages}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 items-center justify-center bg-gray-50 active:bg-gray-100"
                >
                  <Ionicons name="camera-outline" size={24} color="#9CA3AF" />
                  <Text className="text-xs text-gray-400 font-inter-medium mt-1">Добавить</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          <View
            className="p-6 border-t border-gray-100 bg-white"
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-md shadow-gray-200 ${
                itemsToReturnIds.size > 0 && selectedReason ? 'bg-blue-500' : 'bg-gray-200'
              }`}
              onPress={handleSubmit}
              disabled={itemsToReturnIds.size === 0 || !selectedReason || isCreatingReturn}
            >
              {isCreatingReturn ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text
                    className={`font-inter-medium text-base mr-2 ${
                      itemsToReturnIds.size > 0 && selectedReason ? 'text-white' : 'text-gray-500'
                    }`}
                  >
                    Оформить возврат
                  </Text>
                  {itemsToReturnIds.size > 0 && selectedReason && (
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  )}
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
