import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShoppingBag,
  Search,
  Calendar,
  Package,
  CreditCard,
  User,
  Filter,
  Undo2,
  Check,
  Ban,
} from "lucide-react";
import { orderApi } from "../lib/api";
import { formatDate, getDeclension, getOrderStatusColor } from "../lib/utils";
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

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const token = await getToken();
      return orderApi.getAll(token);
    },
  });

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
    <div className="space-y-6 tracking-wide">
      {/* Шапка */}
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

        <div className="flex gap-3 w-full sm:w-auto">
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
                    <th className="w-38">ID заказа</th>
                    <th className="w-88">Клиент</th>
                    <th>Дата</th>
                    <th>Товары</th>
                    <th>Статус</th>
                    <th>Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => {
                    const customer = order.user || {};
                    let displayName = "Аноним";

                    if (customer.firstName || customer.lastName) {
                      displayName = `${customer.firstName || ""} ${customer.lastName || ""
                        }`.trim();
                    } else if (order.shippingAddress?.fullName) {
                      displayName = order.shippingAddress.fullName;
                    }

                    const totalQuantity = order.orderItems.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    );

                    const isUpdating =
                      updateStatusMutation.isPending &&
                      updateStatusMutation.variables?.orderId === order._id;

                    const statusColor = getOrderStatusColor(order.status);

                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-base-50 transition-colors group relative"
                      >
                        {/* 1. ID */}
                        <td className="relative">
                          {order.hasReturnRequested && (
                            <div className="absolute inset-0 z-10 bg-base-100/40 pointer-events-none" />
                          )}
                          <div className="font-semibold text-base-content text-xs bg-base-200 px-2 py-1 rounded-md w-fit">
                            #{order._id.slice(-6).toUpperCase()}
                          </div>
                        </td>

                        {/* 2. Клиент  */}
                        <td className="relative">
                          {order.hasReturnRequested && (
                            <div className="absolute inset-0 z-10 bg-base-100/40  pointer-events-none" />
                          )}
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-10 h-10 rounded-full ring-1 ring-base-200 bg-base-100 flex items-center justify-center overflow-hidden">
                                {customer.imageUrl ? (
                                  <img
                                    src={customer.imageUrl}
                                    alt={displayName}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-base-content/30" />
                                )}
                              </div>
                            </div>

                            <div>
                              <Link
                                to="/customers"
                                className="font-semibold text-sm hover:text-primary hover:underline transition-colors block w-fit"
                                title="Перейти к клиентам"
                              >
                                {displayName}
                              </Link>

                              <div className="text-xs text-base-content/50 flex items-center gap-1.5">
                                {order.shippingAddress?.streetAddress ||
                                  order.shippingAddress?.city}
                              </div>
                            </div>
                          </div>
                        </td>
                        {/* 3. Дата  */}
                        <td className="relative">
                          {order.hasReturnRequested && (
                            <div className="absolute inset-0 z-10 bg-base-100/40  pointer-events-none" />
                          )}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <Calendar className="w-5 h-5 text-base-content/70" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-sm">
                                {order.createdAt
                                  ? formatDate(order.createdAt).split(",")[0]
                                  : "-"}
                              </span>
                              <span className="text-xs text-base-content/50">
                                {order.createdAt
                                  ? formatDate(order.createdAt).split(",")[1]
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </td>
                        {/* 4. Товары  */}
                        <td className="relative">
                          {order.hasReturnRequested && (() => {
                            let borderColor = "border-white";
                            let iconColor = "text-white";
                            let icon = <Undo2 className={`w-4 h-4 ${iconColor}`} strokeWidth={2.5} />;
                            let text = "Запрошен возврат";

                            if (order.returnStatus === "Возврат выполнен") {
                              borderColor = "border-primary";
                              iconColor = "text-primary";
                              icon = <Check className={`w-4 h-4 ${iconColor}`} strokeWidth={3} />;
                              text = "Возврат выполнен";
                            } else if (order.returnStatus === "Отклонено") {
                              borderColor = "border-secondary";
                              iconColor = "text-secondary";
                              icon = <Ban className={`w-4 h-4 ${iconColor}`} strokeWidth={2.5} />;
                              text = "Возврат отклонен";
                            } else if (order.returnStatus === "Одобрено") {
                              borderColor = "border-primary";
                              iconColor = "text-primary";
                              icon = <Check className={`w-4 h-4 ${iconColor}`} strokeWidth={3} />;
                              text = "Возврат одобрен";
                            }

                            return (
                              <div className="absolute inset-0 z-10 bg-base-100/40 pointer-events-none flex items-center justify-center">
                                <Link
                                  to="/returns"
                                  className={`btn btn-sm bg-base-200 ${borderColor} border-2 hover:bg-base-300 -translate-x-34 shadow-xl gap-1.5 pointer-events-auto z-20`}
                                >
                                  {icon}
                                  <span className="text-base-content font-bold">{text}</span>
                                </Link>
                              </div>
                            );
                          })()}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <Package className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">
                                {totalQuantity}{" "}
                                {getDeclension(totalQuantity, [
                                  "товар",
                                  "товара",
                                  "товаров",
                                ])}
                              </span>
                              <span className="text-xs text-base-content/50 max-w-40 truncate">
                                {order.orderItems[0]?.name}
                                {order.orderItems.length > 1 &&
                                  `, (+${order.orderItems.length - 1})`}
                              </span>
                            </div>
                          </div>
                        </td>
                        {/* 5. Статус  */}
                        <td className="relative">
                          {order.hasReturnRequested && (
                            <div className="absolute inset-0 z-10 bg-base-100/40 pointer-events-none" />
                          )}
                          <div className="relative w-fit">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              disabled={isUpdating || order.hasReturnRequested}
                              className={`select select-sm select-bordered font-bold tracking-wide focus:outline-none pr-8 ${statusColor}`}
                            >
                              {STATUS_OPTIONS.map((opt) => (
                                <option
                                  key={opt.value}
                                  value={opt.value}
                                  className="text-base-content bg-base-100"
                                >
                                  {opt.label}
                                </option>
                              ))}
                            </select>

                            {isUpdating && (
                              <div className="absolute right-2 top-1.5 pointer-events-none">
                                <span className="loading loading-spinner loading-xs text-base-content/40"></span>
                              </div>
                            )}
                          </div>
                        </td>
                        {/* 6. Сумма  */}
                        <td className="relative">
                          {order.hasReturnRequested && (
                            <div className="absolute inset-0 z-10 bg-base-100/40 pointer-events-none" />
                          )}
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <CreditCard className="w-5 h-5 text-base-content/70" />
                            </div>
                            <span className="font-semibold text-base">
                              {order.totalPrice?.toLocaleString("ru-RU")} ₽
                            </span>
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
