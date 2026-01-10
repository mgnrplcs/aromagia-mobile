import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';

interface CreateReviewData {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
}

export const useReviews = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const createReview = useMutation({
    mutationFn: async (data: CreateReviewData) => {
      const response = await api.post('/reviews', data);
      return response.data;
    },
    onSuccess: () => {
      // Обновляем кэш отзывов и заказов (чтобы обновился статус hasReviewed)
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    isCreatingReview: createReview.isPending,
    createReviewAsync: createReview.mutateAsync,
    isDeletingReview: deleteReview.isPending,
    deleteReviewAsync: deleteReview.mutateAsync,
  };
};
