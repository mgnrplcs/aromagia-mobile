import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Order } from '@/types';

// Получение списка заказов
export const useOrders = () => {
  const api = useApi();

  const query = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders');
      return data.orders || data;
    },
  });

  return {
    ...query,
    refetch: query.refetch,
  };
};

// Детали заказа
export const useOrderDetails = (orderId: string) => {
  const api = useApi();

  return useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${orderId}`);
      return data.order || data;
    },
    enabled: !!orderId,
  });
};
