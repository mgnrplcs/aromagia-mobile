import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
  ActivityIndicator,
  Animated,
  PanResponder,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { formatPhoneNumber } from '@/lib/utils';

interface AddressFormData {
  label: string;
  fullName: string;
  streetAddress: string;
  city: string;
  region: string;
  zipCode: string;
  phone: string;
  isDefault: boolean;
}

interface AddressFormModalProps {
  visible: boolean;
  isEditing: boolean;
  addressForm: AddressFormData;
  isAddingAddress: boolean;
  isUpdatingAddress: boolean;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (form: AddressFormData) => void;
}

interface InputFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  letterSpacing?: number;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;

const InputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = 'default',
  maxLength,
  letterSpacing = 0,
}: InputFieldProps) => (
  <View className="mb-4">
    <Text className="text-[#111827] font-inter-semibold mb-1.5 text-[14px]">{label}</Text>
    <TextInput
      // ИСПРАВЛЕНО: text-[#111827] вместо text-gray-400
      className="bg-gray-50 border border-gray-200 text-[#111827] rounded-xl h-12 px-4 text-[15px]"
      style={{ textAlignVertical: 'center', letterSpacing }}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      maxLength={maxLength}
    />
  </View>
);

const AddressFormModal = ({
  addressForm,
  isAddingAddress,
  isEditing,
  isUpdatingAddress,
  onClose,
  onFormChange,
  onSave,
  visible,
}: AddressFormModalProps) => {
  const insets = useSafeAreaInsets();
  const isLoading = isAddingAddress || isUpdatingAddress;
  const labels = ['Дом', 'Работа', 'Офис', 'Другое'];

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
      panY.setValue(SCREEN_HEIGHT);
      Animated.parallel([
        Animated.spring(panY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 4,
          speed: 12,
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) panY.setValue(gestureState.dy);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          closeModalAnimated();
        } else {
          Animated.spring(panY, { toValue: 0, useNativeDriver: true }).start();
        }
      },
    })
  ).current;

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={closeModalAnimated}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1 justify-end"
      >
        <Animated.View
          className="absolute top-0 bottom-0 left-0 right-0 bg-black/40"
          style={{ opacity }}
        >
          <TouchableOpacity className="flex-1" activeOpacity={1} onPress={closeModalAnimated} />
        </Animated.View>

        <Animated.View
          className="bg-white w-full overflow-hidden"
          style={{
            maxHeight: '90%',
            transform: [{ translateY: panY }],
          }}
        >
          {/* HEADER */}
          <View {...panResponder.panHandlers} className="bg-white pb-1 w-full z-10 pt-3">
            <View className="items-center pb-3">
              <View className="w-10 h-1 bg-gray-300 rounded-full opacity-80" />
            </View>

            <View className="px-6 pb-2 flex-row items-center justify-between">
              <Text className="text-[#111827] text-2xl font-raleway-bold tracking-tight">
                {isEditing ? 'Редактировать' : 'Новый адрес'}
              </Text>
              <TouchableOpacity
                onPress={closeModalAnimated}
                className="bg-gray-100 p-2 rounded-full active:bg-gray-200"
              >
                <Ionicons name="close" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
            <View className="h-[1px] bg-gray-100 w-full mt-2" />
          </View>

          <ScrollView
            className="px-6 pt-5"
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* МЕТКА */}
            <View className="mb-5">
              <Text className="text-[#111827] font-inter-semibold mb-3 text-[14px]">
                Тип адреса
              </Text>
              <View className="flex-row gap-2.5 flex-wrap">
                {labels.map((tag) => {
                  const isSelected = addressForm.label === tag;
                  return (
                    <TouchableOpacity
                      key={tag}
                      onPress={() => onFormChange({ ...addressForm, label: tag })}
                      className={`px-5 py-3 rounded-xl border ${
                        isSelected ? 'bg-[#111827] border-[#111827]' : 'bg-white border-gray-200'
                      }`}
                      activeOpacity={0.7}
                    >
                      <Text
                        className={`font-inter-semibold tracking-wide text-[13px] ${
                          isSelected ? 'text-white' : 'text-[#6B7280]'
                        }`}
                      >
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <InputField
              label="ФИО Получателя"
              placeholder="Иванов Иван Иванович"
              value={addressForm.fullName}
              onChangeText={(text) => onFormChange({ ...addressForm, fullName: text })}
            />

            <InputField
              label="Телефон"
              placeholder="+7 (999) 000-00-00"
              value={addressForm.phone}
              onChangeText={(text) =>
                onFormChange({
                  ...addressForm,
                  phone: formatPhoneNumber(text),
                })
              }
              keyboardType="phone-pad"
              maxLength={18}
            />

            <InputField
              label="Область / Регион"
              placeholder="Архангельская область"
              value={addressForm.region}
              onChangeText={(text) => onFormChange({ ...addressForm, region: text })}
            />

            <View className="flex-row gap-3 mb-1">
              <View className="flex-1">
                <InputField
                  label="Город"
                  placeholder="Северодвинск"
                  value={addressForm.city}
                  onChangeText={(text) => onFormChange({ ...addressForm, city: text })}
                />
              </View>

              <View className="w-32">
                <InputField
                  label="Индекс"
                  placeholder="164500"
                  value={addressForm.zipCode}
                  onChangeText={(text) => onFormChange({ ...addressForm, zipCode: text })}
                  keyboardType="number-pad"
                  maxLength={6}
                  // ИСПРАВЛЕНО: Убран letterSpacing
                />
              </View>
            </View>

            <InputField
              label="Адрес"
              placeholder="ул. Капитана Воронина, 6Б"
              value={addressForm.streetAddress}
              onChangeText={(text) => onFormChange({ ...addressForm, streetAddress: text })}
            />

            <View className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex-row items-center justify-between mb-6 mt-2">
              <View className="flex-row items-center gap-4 flex-1">
                <View className="w-14 h-14 bg-white rounded-xl items-center justify-center border border-gray-200">
                  <Ionicons name="cart" size={24} color="#111827" />
                </View>

                <View className="flex-1">
                  <Text className="text-[#111827] font-inter-semibold text-lg leading-6">
                    Основной адрес
                  </Text>
                  <Text className="text-gray-400 text-base leading-5 mt-0.5">
                    Использовать в корзине
                  </Text>
                </View>
              </View>

              <Switch
                style={{ alignSelf: 'center' }}
                value={addressForm.isDefault}
                onValueChange={(value) => onFormChange({ ...addressForm, isDefault: value })}
                trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                thumbColor={'#FFFFFF'}
                ios_backgroundColor="#E5E7EB"
              />
            </View>

            <TouchableOpacity
              className={`rounded-2xl h-14 items-center justify-center shadow-sm mb-2 ${
                isLoading ? 'bg-gray-300' : 'bg-black'
              }`}
              activeOpacity={0.8}
              onPress={onSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#121212" />
              ) : (
                <Text className="text-white font-inter-semibold text-[16px]">
                  {isEditing ? 'Сохранить' : 'Добавить адрес'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default AddressFormModal;
