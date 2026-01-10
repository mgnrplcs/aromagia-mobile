import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Brand, Product } from '@/types'; // Убедись, что путь к типам верный

interface RemoveItemModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  product: Product | null;
  volume?: number;
}

export default function RemoveItemModal({
  visible,
  onClose,
  onConfirm,
  product,
  volume,
}: RemoveItemModalProps) {
  if (!product) return null;

  // Хелпер для бренда (как в твоем примере)
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
          <View className="px-6 pt-8 pb-5 items-center">
            <Text className="text-black font-raleway-bold text-xl text-center mb-2.5">
              Удалить из корзины?
            </Text>

            <Text className="text-black/80 font-inter tracking-wide text-center text-[13px] mb-4">
              Вы хотите удалить следующий товар:
            </Text>

            {/* Карточка товара */}
            <View className="w-full flex-row items-center bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4">
              <Image
                source={product.images[0]}
                style={{ width: 48, height: 48, borderRadius: 10 }}
                contentFit="cover"
                className="bg-white"
              />
              <View className="ml-3.5 flex-1">
                <Text
                  className="text-black text-[13px] tracking-wider font-raleway-bold uppercase"
                  numberOfLines={1}
                >
                  {getBrandName(product)}
                </Text>
                <Text
                  className="text-black text-base tracking-wide font-raleway-medium"
                  numberOfLines={1}
                >
                  {product.name}
                </Text>
                {volume && (
                  <View className="bg-black self-start px-1.5 py-0.5 rounded-md mt-1 shadow-sm">
                    <Text className="text-white text-[8px] font-inter-extrabold tracking-wide uppercase">
                      {volume} МЛ
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Предупреждение */}
            <View className="w-full flex-row items-center bg-red-500/5 p-3 rounded-xl border border-red-500/10">
              <Ionicons name="information-circle" size={18} color="#EF4444" />
              <Text className="ml-2 text-red-500/90 font-inter-medium text-sm tracking-wide flex-1">
                Это действие отменить будет нельзя
              </Text>
            </View>
          </View>

          {/* Футер */}
          <View className="flex-row border-t border-gray-100 bg-gray-50 p-4 gap-3">
            <TouchableOpacity
              onPress={onClose}
              className="flex-1 bg-white border border-gray-200 py-2.5 rounded-xl items-center active:bg-gray-100"
            >
              <Text className="text-black font-inter-medium text-[15px]">Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 bg-[#EF4444] py-2.5 rounded-xl items-center shadow-sm active:bg-red-600"
            >
              <Text className="text-white font-inter-medium text-[15px]">Удалить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
