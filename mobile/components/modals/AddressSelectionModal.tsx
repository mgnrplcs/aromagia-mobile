import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAddresses } from '@/hooks/useAddresses';
import { Address } from '@/types';

interface AddressSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onProceed: (address: Address) => void;
  isProcessing: boolean;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function AddressSelectionModal({
  visible,
  onClose,
  onProceed,
  isProcessing,
}: AddressSelectionModalProps) {
  const insets = useSafeAreaInsets();
  const { addresses, isLoading } = useAddresses();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // --- Анимация ---
  const panY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const closeModalAnimated = () => {
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

  const getIconName = (label: string) => {
    const l = label ? label.toLowerCase() : '';
    if (l.includes('работ') || l.includes('офис') || l.includes('work')) return 'briefcase';
    if (l.includes('дом') || l.includes('home')) return 'home';
    return 'planet';
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={closeModalAnimated}
      statusBarTranslucent
    >
      <View className="flex-1 justify-end">
        {/* Затемнение */}
        <Animated.View
          className="absolute top-0 bottom-0 left-0 right-0 bg-black/40"
          style={{ opacity }}
        >
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={closeModalAnimated} />
        </Animated.View>

        {/* Шторка */}
        <Animated.View
          className="bg-white w-full overflow-hidden"
          style={{
            height: '65%',
            paddingBottom: insets.bottom,
            transform: [{ translateY: panY }],
          }}
        >
          {/* Хедер */}
          <View {...panResponder.panHandlers} className="bg-white pb-1 w-full z-10">
            <View className="items-center pt-3">
              <View className="w-10 h-1 bg-gray-300 rounded-full opacity-80" />
            </View>

            <View className="px-6 mt-4 pb-1 flex-row items-center justify-between">
              <Text className="text-black text-2xl font-raleway-bold tracking-tight">
                Выберите адрес
              </Text>
              <TouchableOpacity
                onPress={closeModalAnimated}
                className="bg-gray-100 p-2 rounded-full active:bg-gray-200"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <View className="h-[1px] bg-gray-100 w-full mt-3" />
          </View>

          {/* Список адресов */}
          <ScrollView className="flex-1 px-6 pt-5" showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View className="py-10 items-center">
                <ActivityIndicator size="large" color="#111827" />
              </View>
            ) : addresses && addresses.length > 0 ? (
              <View className="pb-6 gap-3">
                {addresses.map((address) => {
                  const isSelected = selectedAddress?._id === address._id;

                  return (
                    <TouchableOpacity
                      key={address._id}
                      onPress={() => setSelectedAddress(address)}
                      activeOpacity={0.9}
                      className={`rounded-[24px] p-5 border transition-all mb-1 ${
                        isSelected
                          ? 'bg-gray-50 border-black shadow-sm'
                          : 'bg-white border-gray-200 shadow-sm shadow-gray-100'
                      }`}
                    >
                      <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-row items-center gap-3">
                          <View
                            className={`w-10 h-10 rounded-2xl items-center justify-center ${
                              isSelected ? 'bg-white border border-gray-200' : 'bg-gray-50'
                            }`}
                          >
                            <Ionicons name={getIconName(address.label)} size={18} color="#111827" />
                          </View>
                          <Text className="text-black font-raleway-bold tracking-wide text-xl">
                            {address.label}
                          </Text>

                          {address.isDefault && (
                            <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                              <Text className="text-blue-600 text-xs font-inter-bold uppercase tracking-wider">
                                Основной
                              </Text>
                            </View>
                          )}
                        </View>
                        {isSelected && (
                          <View className="bg-black w-8 h-8 rounded-full items-center justify-center">
                            <Ionicons name="checkmark" size={16} color="white" />
                          </View>
                        )}
                      </View>

                      {/* Информация (ФИО, Адрес, Телефон) */}
                      <View>
                        <Text className="text-black font-inter-semibold text-[17px] mb-1.5">
                          {address.fullName}
                        </Text>
                        <Text className="text-black tracking-wide font-inter-medium text-[15px] leading-7">
                          {address.streetAddress}
                        </Text>
                        <Text className="text-gray-500 tracking-wide font-inter text-base leading-6 mb-3">
                          {address.city}, {address.region} {address.zipCode}
                        </Text>
                        <Text className="text-black font-inter-medium text-base tracking-wide">
                          {address.phone}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View className="py-10 items-center justify-center">
                <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                  <Ionicons name="location-outline" size={32} color="#9CA3AF" />
                </View>
                <Text className="text-gray-500 font-inter text-center text-base px-6">
                  У вас пока нет сохраненных адресов. Добавьте адрес в профиле.
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Футер с кнопкой */}
          <View className="px-6 py-4 bg-white border-t border-gray-100">
            <TouchableOpacity
              className={`w-full py-4 rounded-2xl flex-row items-center justify-center shadow-sm ${
                !selectedAddress || isProcessing ? 'bg-gray-100' : 'bg-blue-500'
              }`}
              activeOpacity={0.9}
              onPress={() => {
                if (selectedAddress) onProceed(selectedAddress);
              }}
              disabled={!selectedAddress || isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={!selectedAddress ? '#9CA3AF' : '#FFFFFF'} />
              ) : (
                <>
                  <Text
                    className={`text-white font-inter-bold text-lg mr-2.5 ${
                      !selectedAddress ? 'text-gray-400' : 'text-white'
                    }`}
                  >
                    Перейти к оплате
                  </Text>
                  <View className="bg-white/20 p-1.5 rounded-full">
                    <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                  </View>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
