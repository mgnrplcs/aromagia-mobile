import { useAddresses } from '@/hooks/useAddresses';
import { Address } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { toast } from 'sonner-native';

import PageLoader from '@/components/PageLoader';
import SafeScreen from '@/components/SafeScreen';
import ErrorState from '@/components/ErrorState';
import DeleteAddressModal from '@/components/modals/DeleteAddressModal';
import AddressCard from '@/components/AddressCard';
import AddressFormModal from '@/components/modals/AddressFormModal';

// Начальное состояние формы
const INITIAL_FORM_STATE = {
  label: 'Дом',
  fullName: '',
  streetAddress: '',
  city: '',
  region: '',
  zipCode: '',
  phone: '',
  isDefault: false,
};

function AddressesScreen() {
  const {
    addAddress,
    addresses,
    deleteAddress,
    isAddingAddress,
    isDeletingAddress,
    isError,
    isLoading,
    isUpdatingAddress,
    updateAddress,
    refetch,
  } = useAddresses();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [addressForm, setAddressForm] = useState(INITIAL_FORM_STATE);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleAddAddress = () => {
    setEditingAddressId(null);
    setAddressForm(INITIAL_FORM_STATE);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address._id);
    setAddressForm({
      label: address.label || 'Дом',
      fullName: address.fullName,
      streetAddress: address.streetAddress,
      city: address.city,
      region: address.region,
      zipCode: address.zipCode,
      phone: address.phone,
      isDefault: address.isDefault,
    });
    setShowAddressForm(true);
  };

  const handleDeletePress = (address: Address) => {
    setAddressToDelete(address);
  };

  const confirmDelete = () => {
    if (!addressToDelete) return;

    deleteAddress(addressToDelete._id, {
      onSuccess: () => {
        setAddressToDelete(null);
        toast.success('Адрес удален');
      },
      onError: () => toast.error('Ошибка удаления'),
    });
  };

  const handleSaveAddress = () => {
    const { fullName, streetAddress, city, region, zipCode, phone } = addressForm;

    if (!fullName || !streetAddress || !city || !region || !zipCode || !phone) {
      toast.error('Ошибка', { description: 'Заполните все обязательные поля' });
      return;
    }

    const payload = addressForm as any;

    if (editingAddressId) {
      updateAddress(
        {
          addressId: editingAddressId,
          addressData: payload,
        },
        {
          onSuccess: () => {
            setShowAddressForm(false);
            setEditingAddressId(null);
            toast.success('Успешно', { description: 'Адрес обновлен' });
          },
          onError: (error: any) => {
            toast.error('Ошибка', {
              description: error?.response?.data?.error || 'Не удалось обновить адрес',
            });
          },
        }
      );
    } else {
      addAddress(payload, {
        onSuccess: () => {
          setShowAddressForm(false);
          toast.success('Успешно', { description: 'Новый адрес добавлен' });
        },
        onError: (error: any) => {
          toast.error('Ошибка', {
            description: error?.response?.data?.error || 'Не удалось добавить адрес',
          });
        },
      });
    }
  };

  const handleCloseAddressForm = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
  };

  if (isLoading) return <PageLoader />;

  if (isError) {
    return (
      <SafeScreen>
        <ErrorState onRetry={refetch} showBackButton={true} />
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      {/* --- Шапка --- */}
      <View className="px-6 pt-6 pb-4 bg-white flex-row items-center justify-between border-b border-gray-50">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center border border-gray-100 active:bg-gray-200"
        >
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text className="text-[#111827] text-2xl font-raleway-bold tracking-tight">Адреса</Text>
        <TouchableOpacity
          onPress={handleAddAddress}
          className="bg-gray-50 w-10 h-10 rounded-full items-center justify-center border border-gray-100 active:bg-gray-200"
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color="#111827" />
        </TouchableOpacity>
      </View>

      {/* --- Список --- */}
      <ScrollView
        className="flex-1 bg-background-subtle"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#111827" />
        }
      >
        {addresses.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6 mt-48">
            <View className="w-24 h-24 bg-gray-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="location-outline" size={48} color="#30D158" />
            </View>
            <Text className="text-[#111827] font-raleway-bold text-2xl text-center">
              Ваш список пуст
            </Text>
            <Text className="text-[#6B7280] text-center mt-3 font-inter-light leading-7 px-8 text-[15px]">
              Добавьте адрес доставки, чтобы быстрее оформлять заказы
            </Text>
            <TouchableOpacity
              className="bg-white border border-gray-200 px-8 py-3 rounded-full flex-row items-center  active:bg-gray-50 mt-5"
              activeOpacity={0.8}
              onPress={handleAddAddress}
            >
              <Text className="text-[#111827] font-inter-semibold text-base">Добавить адрес</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6 gap-2">
            {addresses.map((address) => (
              <AddressCard
                key={address._id}
                address={address}
                onEdit={handleEditAddress}
                onDelete={() => handleDeletePress(address)}
                isUpdatingAddress={isUpdatingAddress}
                isDeletingAddress={isDeletingAddress}
              />
            ))}

            <TouchableOpacity
              className="mt-2 border-dashed border-2 border-blue-200 rounded-2xl py-4 items-center bg-blue-50/50 active:bg-blue-100"
              activeOpacity={0.7}
              onPress={handleAddAddress}
            >
              <View className="flex-row items-center">
                <Ionicons name="add-circle-outline" size={22} color="#2563eb" />
                <Text className="text-blue-600 font-inter-semibold text-base ml-2">
                  Добавить еще адрес
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Модалка формы */}
      <AddressFormModal
        visible={showAddressForm}
        isEditing={!!editingAddressId}
        addressForm={addressForm}
        isAddingAddress={isAddingAddress}
        isUpdatingAddress={isUpdatingAddress}
        onClose={handleCloseAddressForm}
        onSave={handleSaveAddress}
        onFormChange={setAddressForm}
      />

      {/* Модалка удаления */}
      <DeleteAddressModal
        visible={!!addressToDelete}
        address={addressToDelete}
        onClose={() => setAddressToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeletingAddress}
      />
    </SafeScreen>
  );
}
export default AddressesScreen;
