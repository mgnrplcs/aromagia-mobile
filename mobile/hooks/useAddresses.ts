import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Address } from '@/types';

export const useAddresses = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const {
    data: addresses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const { data } = await api.get<{ addresses: Address[] }>('/users/addresses');
      return data.addresses || [];
    },
  });

  const addAddressMutation = useMutation({
    mutationFn: async (addressData: Partial<Address>) => {
      const { data } = await api.post('/users/addresses', addressData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({
      addressId,
      addressData,
    }: {
      addressId: string;
      addressData: Partial<Address>;
    }) => {
      const { data } = await api.put(`/users/addresses/${addressId}`, addressData);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (addressId: string) => {
      await api.delete(`/users/addresses/${addressId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  return {
    addresses,
    isLoading,
    isError,
    refetch,
    addAddress: addAddressMutation.mutate,
    updateAddress: updateAddressMutation.mutate,
    deleteAddress: deleteAddressMutation.mutate,
    isAddingAddress: addAddressMutation.isPending,
    isUpdatingAddress: updateAddressMutation.isPending,
    isDeletingAddress: deleteAddressMutation.isPending,
  };
};
