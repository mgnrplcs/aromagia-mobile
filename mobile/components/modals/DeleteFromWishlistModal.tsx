import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Brand, Product } from '@/types/types';

interface DeleteProductModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
}

export default function DeleteProductModal({
  visible,
  onClose,
  onConfirm,
  product,
}: DeleteProductModalProps) {
  if (!product) return null;

  // Хелпер для бренда
  const getBrandName = (item: Product) => {
    if (item.brand && typeof item.brand === 'object' && 'name' in item.brand) {
      return (item.brand as Brand).name;
    }
    return 'Бренд';
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-black/40 items-center justify-center px-4">
        <View className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl">
          {/* Кнопка закрытия */}
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-3 right-3 z-10 p-2 bg-gray-50 rounded-full"
          >
            <Ionicons name="close" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <View className="px-6 pt-8 pb-6 items-center">
            {/* Иконка */}
            <View className="w-14 h-14 rounded-full bg-red-50 items-center justify-center mb-3">
              <Ionicons name="trash" size={28} color="#EF4444" />
            </View>

            <Text className="text-[#111827] font-raleway-bold text-xl text-center mb-2">
              Удалить из избранного?
            </Text>

            <Text className="text-[#6B7280] font-inter text-center text-[13px] mb-5">
              Вы собираетесь удалить следующий товар:
            </Text>

            {/* Карточка */}
            <View className="w-full flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
              <Image
                source={product.images[0]}
                style={{ width: 48, height: 48, borderRadius: 10 }}
                contentFit="cover"
                className="bg-white"
              />
              <View className="ml-3 flex-1">
                <Text
                  className="text-[#6B7280] text-[11px] tracking-wide font-inter-semibold uppercase"
                  numberOfLines={1}
                >
                  {getBrandName(product)}
                </Text>
                <Text
                  className="text-[#111827] text-base tracking-wide font-raleway-bold"
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
              </View>
            </View>

            {/* Предупреждение */}
            <View className="w-full flex-row items-center bg-orange-50 p-3 rounded-xl border border-orange-100/50">
              <Ionicons
                name="information-circle"
                size={18}
                color="#F97316"
                style={{ marginRight: 7 }}
              />
              <Text className="text-orange-500 text-sm font-inter-medium">
                Это действие нельзя будет отменить
              </Text>
            </View>
          </View>

          {/* Футер */}
          <View className="flex-row border-t border-gray-100 bg-gray-50 p-4 gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center active:bg-gray-100"
            >
              <Text className="text-[#374151] font-inter-bold text-[15px]">Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 bg-[#EF4444] py-3 rounded-xl items-center shadow-sm active:bg-red-600"
            >
              <Text className="text-white font-inter-bold text-[15px]">Удалить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
