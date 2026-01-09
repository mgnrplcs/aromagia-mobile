import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '@/types';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (addressId: string, label: string) => void;
  isUpdatingAddress: boolean;
  isDeletingAddress: boolean;
}

export default function AddressCard({
  address,
  onEdit,
  onDelete,
  isUpdatingAddress,
  isDeletingAddress,
}: AddressCardProps) {
  return (
    <View className="bg-white rounded-[24px] p-6 mb-2 border border-gray-200 shadow-sm shadow-gray-100">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-3">
          <View className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center">
            <Ionicons
              name={
                address.label === 'Работа' || address.label === 'Офис'
                  ? 'briefcase'
                  : address.label === 'Дом'
                    ? 'home'
                    : 'planet'
              }
              size={22}
              color="#111827"
            />
          </View>
          <Text className="text-black font-raleway-bold tracking-wide text-xl">
            {address.label}
          </Text>
        </View>

        {address.isDefault && (
          <View className="bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
            <Text className="text-blue-600 text-xs font-inter-bold uppercase tracking-wider">
              Основной
            </Text>
          </View>
        )}
      </View>

      <View className="mb-4">
        <Text className="text-black tracking-wide font-inter-semibold text-xl mb-2.5">
          {address.fullName}
        </Text>

        <Text className="text-black tracking-wide font-inter-medium text-[15px] leading-7">
          {address.streetAddress}
        </Text>
        <Text className="text-gray-500 tracking-wide font-inter text-base leading-6 mb-3">
          {address.city}, {address.region}, {address.zipCode}
        </Text>

        <View className="flex-row items-center">
          <Text className="text-black font-inter-medium text-base tracking-wide">
            {address.phone}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-3.5">
        <TouchableOpacity
          className="flex-1 bg-gray-50 py-3 rounded-xl items-center justify-center active:bg-gray-100 shadow-sm"
          activeOpacity={0.7}
          onPress={() => onEdit(address)}
          disabled={isUpdatingAddress}
        >
          <Text className="text-black font-inter-semibold tracking-wide text-[14px]">Изменить</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-1 bg-red-500 py-3 rounded-xl items-center justify-center active:bg-red-600 shadow-sm"
          activeOpacity={0.7}
          onPress={() => onDelete(address._id, address.label)}
          disabled={isDeletingAddress}
        >
          <Text className="text-white font-inter-semibold tracking-wide text-[14px]">Удалить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
