import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddressesHeaderProps {
  onAddPress: () => void;
}

export default function AddressesHeader({ onAddPress }: AddressesHeaderProps) {
  return (
    <View className="px-6 pt-6 pb-4 bg-white flex-row items-center justify-between border-b border-gray-50">
      <Text className="text-[#111827] text-3xl font-raleway-bold tracking-tight">Адреса</Text>
      <TouchableOpacity
        onPress={onAddPress}
        className="bg-primary/10 w-10 h-10 rounded-full items-center justify-center border border-primary/20"
        activeOpacity={0.7}
      >
        <Ionicons name="add" size={24} color="#111827" />
      </TouchableOpacity>
    </View>
  );
}
