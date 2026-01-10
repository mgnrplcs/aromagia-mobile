import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  PanResponder,
  Dimensions,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Order, Product } from '@/types';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
  productRatings: { [key: string]: number };
  onRatingChange: (productId: string, rating: number) => void;
  productComments: { [key: string]: string };
  onCommentChange: (productId: string, text: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function RatingModal({
  visible,
  onClose,
  order,
  productRatings,
  onRatingChange,
  productComments,
  onCommentChange,
  onSubmit,
  isSubmitting,
}: RatingModalProps) {
  const insets = useSafeAreaInsets();

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

  // --- Жесты ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
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

  if (!order) return null;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={closeModalAnimated}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        {/* Затемнение фона */}
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
          <View {...panResponder.panHandlers} className="bg-white pb-2 w-full z-10 pt-3">
            <View className="items-center">
              <View className="w-10 h-1 bg-gray-300 rounded-full opacity-80" />
            </View>

            <View className="px-6 mt-4 flex-row items-center justify-between">
              <View>
                <Text className="text-black text-2xl font-raleway-semibold tracking-wide">
                  Оцените покупку
                </Text>
                <Text className="text-gray-500 font-inter text-base">
                  Заказ №{order._id.slice(-6).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeModalAnimated}
                disabled={isSubmitting}
                className="bg-gray-100 p-2 rounded-full active:bg-gray-200"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <View className="h-[1px] bg-gray-100 w-full mt-4" />
          </View>

          {/* Контент */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            className="flex-1"
          >
            <ScrollView
              className="flex-1 px-6 pt-3"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="gap-6">
                {order.orderItems.map((item) => {
                  const product = item.product as Product;
                  const currentRating = productRatings[product._id] || 0;
                  const currentComment = productComments[product._id] || '';

                  return (
                    <View
                      key={item._id}
                      className="bg-gray-50/60 p-4 rounded-[20px] border border-gray-100"
                    >
                      {/* Карточка товара */}
                      <View className="flex-row items-start mb-4">
                        <View className="bg-white rounded-xl p-1 mr-3">
                          <Image
                            source={product.images?.[0]}
                            style={{ width: 50, height: 50, borderRadius: 8 }}
                            contentFit="contain"
                          />
                        </View>

                        <View className="flex-1 pt-1">
                          <Text
                            numberOfLines={1}
                            className="text-black text-sm font-raleway-bold uppercase tracking-widest mb-0.5"
                          >
                            {typeof product.brand === 'object' ? product.brand.name : 'Бренд'}
                          </Text>
                          <Text
                            numberOfLines={2}
                            className="text-black font-raleway-medium text-base leading-5 mb-1.5"
                          >
                            {product.name}
                          </Text>
                          {item.volume || product.volume ? (
                            <View className="bg-white border border-gray-300 px-2 py-[2px] rounded-[5px] self-start">
                              <Text className="text-[9px] font-inter-semibold text-black/90 uppercase">
                                {item.volume || product.volume} мл
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      </View>

                      {/* Звезды */}
                      <View className="flex-row justify-center bg-white py-2 rounded-xl border border-gray-200/60 mb-3 shadow-sm shadow-gray-100">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <TouchableOpacity
                            key={star}
                            onPress={() => onRatingChange(product._id, star)}
                            activeOpacity={0.7}
                            className="px-2"
                          >
                            <Ionicons
                              name={star <= currentRating ? 'star' : 'star-outline'}
                              size={30}
                              color={star <= currentRating ? '#FBBF24' : '#e5e5e5'}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>

                      {/* Текстовое поле */}
                      <TextInput
                        placeholder="Напишите ваш отзыв..."
                        placeholderTextColor="#cccccc"
                        multiline
                        textAlignVertical="top"
                        className="bg-white border border-gray-200 rounded-xl p-3.5 font-inter text-[13px] tracking-wide h-24 text-black shadow-sm shadow-gray-100"
                        value={currentComment}
                        onChangeText={(text) => onCommentChange(product._id, text)}
                      />
                    </View>
                  );
                })}
              </View>
            </ScrollView>

            {/* Футер */}
            <View
              className="p-6 border-t border-gray-100 bg-white"
              style={{ paddingBottom: insets.bottom + 16 }}
            >
              <TouchableOpacity
                className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-md shadow-gray-200 ${
                  isSubmitting ? 'bg-gray-100' : 'bg-blue-500'
                }`}
                activeOpacity={0.9}
                onPress={onSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <>
                    <Text className="text-white font-inter-semibold text-[16px] mr-3">
                      Отправить отзыв
                    </Text>
                    <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Animated.View>
      </View>
    </Modal>
  );
}
