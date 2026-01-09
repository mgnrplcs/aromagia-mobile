import React from 'react';
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
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Order, Product } from '@/types';

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
  order: Order | null;
  // Рейтинг (звезды)
  productRatings: { [key: string]: number };
  onRatingChange: (productId: string, rating: number) => void;
  // Комментарии (текст)
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
  if (!order) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Сдвигаем контент при открытии клавиатуры (особенно важно для iOS) */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-black/50 justify-end"
      >
        {/* Контейнер модалки */}
        <View className="bg-white w-full h-[85%] rounded-t-[32px] overflow-hidden">
          {/* Хедер */}
          <View className="px-6 pt-6 pb-4 flex-row items-center justify-between border-b border-gray-100">
            <View>
              <Text className="text-black text-2xl font-raleway-bold tracking-tight">
                Оцените покупку
              </Text>
              <Text className="text-gray-500 font-inter text-sm mt-1">
                Заказ №{order._id.slice(-6).toUpperCase()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={onClose}
              disabled={isSubmitting}
              className="bg-gray-50 p-2 rounded-full active:bg-gray-200"
            >
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Список товаров */}
          <ScrollView
            className="flex-1 px-6 pt-4"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-black/80 font-inter leading-6 mb-6">
              Поделитесь впечатлениями о товарах. Ваше мнение поможет другим покупателям.
            </Text>

            <View className="gap-6">
              {order.orderItems.map((item) => {
                const product = item.product as Product;
                const currentRating = productRatings[product._id] || 0;
                const currentComment = productComments[product._id] || '';

                return (
                  <View
                    key={item._id}
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100"
                  >
                    {/* Инфо о товаре */}
                    <View className="flex-row items-center mb-4">
                      <Image
                        source={product.images?.[0]}
                        style={{ width: 48, height: 48, borderRadius: 10 }}
                        contentFit="cover"
                        className="bg-white"
                      />
                      <View className="ml-3 flex-1">
                        <Text
                          numberOfLines={1}
                          className="text-black font-raleway-bold text-sm tracking-wide uppercase"
                        >
                          {typeof product.brand === 'object' ? product.brand.name : 'Бренд'}
                        </Text>
                        <Text
                          numberOfLines={1}
                          className="text-black font-inter-medium text-[15px]"
                        >
                          {product.name}
                        </Text>
                      </View>
                    </View>

                    {/* Звезды */}
                    <View className="flex-row justify-between bg-white p-3 rounded-xl border border-gray-100 mb-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <TouchableOpacity
                          key={star}
                          onPress={() => onRatingChange(product._id, star)}
                          activeOpacity={0.7}
                          className="p-1"
                        >
                          <Ionicons
                            name={star <= currentRating ? 'star' : 'star-outline'}
                            size={32}
                            color={star <= currentRating ? '#FBBF24' : '#E5E7EB'}
                          />
                        </TouchableOpacity>
                      ))}
                    </View>

                    {/* Текстовое поле для комментария */}
                    <TextInput
                      placeholder="Напишите ваш отзыв..."
                      placeholderTextColor="#9CA3AF"
                      multiline
                      textAlignVertical="top"
                      className="bg-white border border-gray-200 rounded-xl p-3 font-inter text-sm h-24 text-black"
                      value={currentComment}
                      onChangeText={(text) => onCommentChange(product._id, text)}
                    />
                  </View>
                );
              })}
            </View>
          </ScrollView>

          {/* Футер с кнопкой */}
          <View className="p-6 border-t border-gray-100 bg-white pb-8">
            <TouchableOpacity
              className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-sm ${
                isSubmitting ? 'bg-gray-100' : 'bg-black active:bg-gray-900'
              }`}
              activeOpacity={0.9}
              onPress={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <>
                  <Text className="text-white font-inter-bold text-[16px] mr-2">
                    Отправить отзыв
                  </Text>
                  <Ionicons name="paper-plane" size={18} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
