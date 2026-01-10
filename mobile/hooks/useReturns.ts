import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { ReturnRequest } from '@/types';

interface CreateReturnData {
  orderId: string;
  reason: string;
  items: string;
  details?: string;
  images?: any[];
}

export const useReturns = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  // Получение списка возвратов
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['returns'],
    queryFn: async () => {
      const response = await api.get<ReturnRequest[]>('/returns');
      return response.data;
    },
  });

  // Создание заявки
  const createReturn = useMutation({
    mutationFn: async (data: CreateReturnData) => {
      const formData = new FormData();
      formData.append('orderId', data.orderId);
      formData.append('reason', data.reason);
      formData.append('items', data.items);
      if (data.details) formData.append('details', data.details);

      if (data.images && data.images.length > 0) {
        data.images.forEach((image, index) => {
          formData.append('images', {
            uri: image.uri,
            name: `return_${index}.jpg`,
            type: 'image/jpeg',
          } as any);
        });
      }

      const response = await api.post('/returns', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['returns'] });
    },
  });

  return {
    returns: data,
    isLoading,
    isError,
    refetch,
    isCreatingReturn: createReturn.isPending,
    createReturnAsync: createReturn.mutateAsync,
  };
};
