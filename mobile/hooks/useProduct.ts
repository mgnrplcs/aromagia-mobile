import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Product } from '@/types';

export const useProduct = (id: string) => {
  const api = useApi();

  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<{ product: Product }>(`/products/${id}`);
      return data.product;
    },
    enabled: !!id, // Не делать запрос, пока нет ID
  });
};
