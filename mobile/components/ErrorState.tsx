import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryText?: string;
  showBackButton?: boolean;
  contentContainerStyle?: string;
}

export default function ErrorState({
  title = 'Что-то пошло не так',
  description = 'Не удалось загрузить данные. Проверьте соединение с интернетом.',
  retryText = 'Обновить',
  onRetry,
  showBackButton = false,
  contentContainerStyle = '',
}: ErrorStateProps) {
  return (
    <View className={`flex-1 items-center justify-center ${contentContainerStyle}`}>
      {showBackButton && (
        <View className="absolute top-0 left-0 right-0 px-6 pt-4 pb-2 z-10">
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={10}
            className="w-10 h-10 bg-white rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
        </View>
      )}

      {/* Центральный блок */}
      <View className="items-center justify-center px-6 min-h-[300px]">
        <View className="bg-red-50 w-20 h-20 rounded-full items-center justify-center mb-4">
          <Ionicons name="cloud-offline-outline" size={38} color="#EF4444" />
        </View>

        <Text className="text-[#111827] font-raleway-bold text-xl text-center mb-2">{title}</Text>

        <Text className="text-[#6B7280] text-center font-inter text-base mb-4 px-4 leading-6">
          {description}
        </Text>

        {onRetry && (
          <TouchableOpacity
            onPress={onRetry}
            className="bg-white border border-gray-200 px-6 py-2.5 rounded-full flex-row items-center active:bg-gray-50"
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={16} color="#374151" style={{ marginRight: 8 }} />
            <Text className="text-[#374151] font-inter-semibold text-sm">{retryText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
