import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '@/lib/api';
import { Cart } from '@/types';

const useCart = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  // Получение текущей корзины
  const {
    data: cart,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get<{ cart: Cart }>('/cart');
      return data.cart;
    },
  });

  // Добавить товар в корзину
  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
      const { data } = await api.post<{ cart: Cart }>('/cart', { productId, quantity });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // Обновить количество товара
  const updateQuantityMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const { data } = await api.put<{ cart: Cart }>(`/cart/${productId}`, { quantity });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // Удалить один товар из корзины
  const removeFromCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await api.delete<{ cart: Cart }>(`/cart/${productId}`);
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // Полная очистка корзины
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ cart: Cart }>('/cart');
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // Применить промокод
  const applyCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post<{ cart: Cart }>('/cart/coupon', { code });
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
    onError: (error: any) => {
      throw error;
    },
  });

  // Удалить купон
  const removeCouponMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<{ cart: Cart }>('/cart/coupon');
      return data.cart;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] }),
  });

  // === Расчеты ===

  // 1. Сумма товаров БЕЗ скидки
  const cartSubtotal = cart?.subtotal ?? 0;

  // 2. Итоговая цена к оплате
  const cartFinalPrice = cart?.totalPrice ?? 0;

  // 3. Размер скидки
  const discountAmount = cartSubtotal - cartFinalPrice;

  // 4. Количество товаров
  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return {
    cart,
    isLoading,
    isError,
    cartSubtotal,
    cartFinalPrice,
    cartTotal: cartFinalPrice,
    discountAmount,
    cartItemCount,

    // Методы
    refetch,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    applyCoupon: applyCouponMutation.mutate,
    removeCoupon: removeCouponMutation.mutate,

    // Состояния загрузки
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
    isClearing: clearCartMutation.isPending,
    isApplyingCoupon: applyCouponMutation.isPending,
  };
};
export default useCart;
