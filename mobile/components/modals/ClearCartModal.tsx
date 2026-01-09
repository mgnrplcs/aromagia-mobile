import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ClearCartModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ClearCartModal({ visible, onClose, onConfirm }: ClearCartModalProps) {
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
            {/* Заголовок */}
            <Text className="text-black font-raleway-bold text-xl text-center mb-2">
              Очистить корзину?
            </Text>

            {/* Описание действия */}
            <Text className="text-black/80 font-inter tracking-wide leading-6 text-center text-[13px] mb-4">
              Вы уверены, что хотите удалить все товары из корзины?
            </Text>

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
              <Text className="text-white font-inter-medium text-[15px]">Очистить</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
