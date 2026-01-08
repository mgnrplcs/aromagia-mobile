import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '@/types';

interface DeleteAddressModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  address: Address | null;
  isDeleting: boolean;
}

export default function DeleteAddressModal({
  visible,
  onClose,
  onConfirm,
  address,
  isDeleting,
}: DeleteAddressModalProps) {
  if (!address) return null;

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
          <View className="px-6 pt-8 pb-6 items-center">
            <Text className="text-[#111827] font-raleway-bold text-xl text-center mb-3">
              Удалить адрес?
            </Text>

            <Text className="text-[#6B7280] font-inter text-center text-[13px] mb-5">
              Вы собираетесь удалить следующий адрес:
            </Text>

            {/* Карточка удаляемого объекта */}
            <View className="w-full flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-4">
              <View className="w-14 h-14 bg-white rounded-2xl items-center justify-center border border-gray-200">
                <Ionicons
                  name={address.label === 'Работа' ? 'briefcase' : 'home'}
                  size={20}
                  color="#111827"
                />
              </View>
              <View className="ml-3.5 flex-1 pr-4">
                <Text
                  className="text-[#111827] text-[15px] tracking-wide font-raleway-semibold mb-1"
                  numberOfLines={1}
                >
                  {address.label}
                </Text>
                <Text
                  className="text-[#6B7280] tracking-wide text-[13px] font-inter leading-4"
                  numberOfLines={1}
                >
                  {address.streetAddress}
                </Text>
              </View>
            </View>

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
              disabled={isDeleting}
              className="flex-1 bg-white border border-gray-200 py-3 rounded-xl items-center active:bg-gray-100"
            >
              <Text className="text-[#374151] font-inter-semibold text-[15px]">Отмена</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-[#EF4444] py-3 rounded-xl items-center shadow-sm active:bg-red-600"
            >
              {isDeleting ? (
                <Text className="text-white font-inter-semibold text-[15px]">...</Text>
              ) : (
                <Text className="text-white font-inter-semibold text-[15px]">Удалить</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
