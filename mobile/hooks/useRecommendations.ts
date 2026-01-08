import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Product } from '@/types';

export const useRecommendations = (productId?: string) => {
  const api = useApi();

  return useQuery({
    queryKey: ['recommendations', productId],
    queryFn: async () => {
      const { data } = await api.get<{ products: Product[] }>(`/products/recommendations`, {
        params: { productId },
      });
      return data.products;
    },
    enabled: !!productId,
  });
};
