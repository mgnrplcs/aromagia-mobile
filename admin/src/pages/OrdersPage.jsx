import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  Search,
  Filter,
  MapPin,
  Calendar,
  Package,
  CreditCard,
  User,
} from "lucide-react";
import { orderApi } from "../lib/api";
import { formatDate, getDeclension } from "../lib/utils";
import PageLoader from "../components/PageLoader";

// Словарь статусов для отображения
const STATUS_LABELS = {
  pending: "В обработке",
  shipped: "Отправлен",
  delivered: "Доставлен",
  cancelled: "Отменен",
};

// Словарь цветов для статусов (для селекта)
const STATUS_COLORS = {
  pending: "text-warning",
  shipped: "text-info",
  delivered: "text-success",
  cancelled: "text-error",
};

function OrdersPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Загрузка заказов
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const token = await getToken();
      return orderApi.getAll(token);
    },
  });

  // 2. Мутация обновления статуса
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const token = await getToken();
      return orderApi.updateStatus({ orderId, status }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Если есть статистика на дашборде, обновляем её тоже
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (error) => {
      alert("Ошибка обновления статуса: " + error.message);
    },
  });

  const handleStatusChange = (orderId, newStatus) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const orders = ordersData?.orders || [];

  // 3. Фильтрация (поиск по ID, Имени клиента или Городу)
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.toLowerCase();
    const orderId = order._id.slice(-6).toLowerCase();
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
      {/* === Шапка === */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl shadow-sm">
        {/* Заголовок */}
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

        {/* Поиск и Фильтр */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Поиск заказа..."
              className="input input-bordered w-full pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-base-content/50" />
          </div>
          <button className="btn btn-square btn-ghost border border-base-200">
            <Filter className="w-5 h-5 text-base-content" />
          </button>
        </div>
      </div>

      {/* === Таблица === */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-0">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-20 text-base-content/50">
              <div className="flex justify-center mb-4">
                <ShoppingBag className="w-16 h-16 opacity-20" />
              </div>
              <p className="text-xl font-semibold mb-1">Заказы не найдены</p>
              <p className="text-sm">Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-lg whitespace-nowrap">
                <thead className="bg-base-200/50 text-base-content/70">
                  <tr>
                    <th>Заказ</th>
                    <th>Клиент</th>
                    <th>Состав заказа</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                    <th>Дата</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    // Подсчет общего кол-ва товаров
                    const totalQuantity = order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );

                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-base-50 transition-colors group"
                      >
                        {/* 1. ID Заказа */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-base-200 flex items-center justify-center font-mono font-bold text-base-content/70 text-xs">
                              #{order._id.slice(-4).toUpperCase()}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">
                                ID: {order._id.slice(-8).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 2. Клиент */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="bg-neutral text-neutral-content rounded-full w-8 h-8">
                                <span className="text-xs">
                                  <User className="w-4 h-4" />
                                </span>
                              </div>
                            </div>
                            <div>
                              <div className="font-bold text-sm">
                                {order.shippingAddress?.fullName ||
                                  "Неизвестно"}
                              </div>
                              <div className="text-xs text-base-content/50 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" />
                                {order.shippingAddress?.city},{" "}
                                {order.shippingAddress?.state}
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
                            {order.totalPrice.toLocaleString("ru-RU")} ₽
                          </div>
                        </td>

                        {/* 5. Статус (Select) */}
                        <td>
                          <div className="relative">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              disabled={updateStatusMutation.isPending}
                              className={`select select-sm select-bordered w-36 font-medium focus:outline-none ${
                                STATUS_COLORS[order.status] || ""
                              }`}
                            >
                              <option value="pending">В обработке</option>
                              <option value="shipped">Отправлен</option>
                              <option value="delivered">Доставлен</option>
                              <option value="cancelled">Отменен</option>
                            </select>
                            {/* Спиннер загрузки, если обновляется именно этот заказ */}
                            {updateStatusMutation.isPending &&
                              updateStatusMutation.variables?.orderId ===
                                order._id && (
                                <div className="absolute right-8 top-2">
                                  <span className="loading loading-spinner loading-xs text-primary"></span>
                                </div>
                              )}
                          </div>
                        </td>

                        {/* 6. Дата */}
                        <td>
                          <div className="flex items-center gap-2 text-sm text-base-content/70">
                            <Calendar className="w-4 h-4 text-base-content/40" />
                            {formatDate(order.createdAt)}
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
