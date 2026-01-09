import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  Search,
  MapPin,
  Calendar,
  Package,
  CreditCard,
  User,
} from "lucide-react";
import { orderApi } from "../lib/api";
import { formatDate, getDeclension } from "../lib/utils";
import PageLoader from "../components/PageLoader";

const STATUS_OPTIONS = [
  { value: "В ожидании", label: "В ожидании" },
  { value: "Оплачен", label: "Оплачен" },
  { value: "Отправлен", label: "Отправлен" },
  { value: "Доставлен", label: "Доставлен" },
  { value: "Отменен", label: "Отменен" },
];

function OrdersPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // --- ЗАГРУЗКА ---
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const token = await getToken();
      return orderApi.getAll(token);
    },
  });

  // --- МУТАЦИЯ СТАТУСА ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const token = await getToken();
      return orderApi.updateStatus({ orderId, status }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message;
      alert(`Ошибка: ${message}`);
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const orders =
    ordersData?.orders || (Array.isArray(ordersData) ? ordersData : []) || [];

  // --- ФИЛЬТР ---
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const orderId = order._id ? order._id.slice(-6).toLowerCase() : "";
    const customerName = order.shippingAddress?.fullName?.toLowerCase() || "";
    const city = order.shippingAddress?.city?.toLowerCase() || "";

    return (
      orderId.includes(searchLower) ||
      customerName.includes(searchLower) ||
      city.includes(searchLower)
    );
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-raleway">Заказы</h1>
            <p className="text-base-content/70 text-sm">
              Всего заказов: {orders.length}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Поиск (ID, Имя, Город)..."
              className="input input-bordered w-full pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-base-content/50" />
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-base-content/50">
              <div className="flex justify-center mb-4">
                <ShoppingBag className="w-16 h-16 opacity-20" />
              </div>
              <p className="text-xl font-semibold mb-1">Заказы не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-lg whitespace-nowrap">
                <thead className="bg-base-200/50 text-base-content/70">
                  <tr>
                    <th>Заказ</th>
                    <th>Клиент</th>
                    <th>Товары</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const totalQuantity = order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );

                    const isUpdating =
                      updateStatusMutation.isPending &&
                      updateStatusMutation.variables?.orderId === order._id;

                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-base-50 transition-colors group"
                      >
                        {/* 1. ID */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-base-200 flex items-center justify-center font-mono font-bold text-base-content/70 text-xs shadow-sm">
                              #{order._id.slice(-4).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">
                                {order._id.slice(0, 8)}...
                              </span>
                              <span className="text-xs text-base-content/50">
                                ID
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Клиент */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral/10 text-neutral rounded-full w-8 h-8">
                                <span className="text-xs">
                                  <User className="w-4 h-4" />
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-sm">
                                {order.shippingAddress?.fullName || "Аноним"}
                              </div>
                              <div className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {order.shippingAddress?.city},{" "}
                                {order.shippingAddress?.region}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Товары */}
                        <td>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <Package className="w-4 h-4 text-primary" />
                              {totalQuantity}{" "}
                              {getDeclension(totalQuantity, [
                                "товар",
                                "товара",
                                "товаров",
                              ])}
                            </div>
                            <div className="text-xs text-base-content/50 pl-6 max-w-50 truncate">
                              {order.orderItems[0]?.name}
                              {order.orderItems.length > 1 &&
                                ` + ещё ${order.orderItems.length - 1}`}
                            </div>
                          </div>
                        </td>

                        {/* 4. Сумма */}
                        <td>
                          <div className="flex items-center gap-2 font-bold text-base">
                            <CreditCard className="w-4 h-4 text-base-content/40" />
                            {order.totalPrice?.toLocaleString("ru-RU")} ₽
                          </div>
                        </td>

                        {/* 5. Статус */}
                        <td>
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              disabled={isUpdating}
                              className="select select-sm select-bordered w-36 font-semibold text-primary tracking-wide focus:outline-none"
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.label}
                                </option>
                              ))}
                            </select>
                            {/* Спиннер */}
                            {isUpdating && (
                              <div className="absolute right-2 top-2">
                                <span className="loading loading-spinner loading-xs text-primary"></span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 6. Дата */}
                        <td>
                          <div className="flex items-center gap-2 text-sm text-base-content/70">
                            <Calendar className="w-4 h-4 text-base-content/40" />
                            {order.createdAt
                              ? formatDate(order.createdAt)
                              : "-"}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
