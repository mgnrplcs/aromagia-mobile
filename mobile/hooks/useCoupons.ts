import { useQuery } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

export interface CouponData {
  _id: string;
  code: string;
  discountAmount: number;
  minPurchaseAmount: number;
  validUntil: string;
  isActive: boolean;
}

export const useCoupons = () => {
  const api = useApi();

  return useQuery({
    queryKey: ['coupons-list'],
    queryFn: async () => {
      const { data } = await api.get<CouponData[]>('/users/coupons');
      return data;
    },
  });
};
