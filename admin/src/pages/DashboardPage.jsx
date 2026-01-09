import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  PiggyBank,
  ShoppingBagIcon,
  UsersIcon,
  Package,
  Calendar,
  CreditCard,
  User,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { orderApi, statsApi } from "../lib/api";
import PageLoader from "../components/PageLoader";
import { formatDate, getDeclension, getOrderStatusColor } from "../lib/utils";

const STATUS_OPTIONS = [
  { value: "В ожидании", label: "В ожидании" },
  { value: "Оплачен", label: "Оплачен" },
  { value: "Отправлен", label: "Отправлен" },
  { value: "Доставлен", label: "Доставлен" },
  { value: "Отменен", label: "Отменен" },
];

function DashboardPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // --- 1. Загрузка данных ---
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const token = await getToken();
      return orderApi.getAll(token);
    },
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const token = await getToken();
      return statsApi.getDashboard(token);
    },
  });

  // --- 2. Логика изменения статуса ---
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

  const recentOrders = ordersData?.orders || [];

  // --- 3. Карточки статистики ---
  const statsCards = [
    {
      name: "Общая выручка",
      value: statsLoading
        ? "..."
        : `${statsData?.totalRevenue?.toLocaleString("ru-RU") || 0} ₽`,
      icon: <PiggyBank className="size-8 text-primary" />,
      color: "#10b981",
      data: statsData?.charts?.revenue || [],
    },
    {
      name: "Всего заказов",
      value: statsLoading ? "..." : statsData?.totalOrders || 0,
      icon: <ShoppingBagIcon className="size-7 text-blue-400" />,
      color: "#3b82f6",
      data: statsData?.charts?.orders || [],
    },
    {
      name: "Клиенты",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: <UsersIcon className="size-7 text-purple-400" />,
      color: "#8b5cf6",
      data: statsData?.charts?.customers || [],
    },
    {
      name: "Товары",
      value: statsLoading ? "..." : statsData?.totalProducts || 0,
      icon: <Package className="size-7 text-amber-400" />,
      color: "#f59e0b",
      data: statsData?.charts?.products || [],
    },
  ];

  if (ordersLoading || statsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 tracking-wide">
      {/* Сетка карточек с графиками */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <div
            key={stat.name}
            className="card bg-base-100 shadow-sm border border-base-200 overflow-hidden relative"
          >
            <div className="card-body p-5">
              <div className="flex justify-between items-start z-10 relative">
                <div>
                  <div className="text-xs font-raleway font-bold text-base-content/50 uppercase tracking-widest mb-1">
                    {stat.name}
                  </div>
                  <div className="text-2xl font-bold ">{stat.value}</div>
                </div>
                <div
                  className="p-2 rounded-xl bg-base-200/50 text-base-content/70"
                  style={{ color: stat.color }}
                >
                  {stat.icon}
                </div>
              </div>
            </div>

            {/* Графики */}
            <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stat.data}>
                  <defs>
                    <linearGradient
                      id={`color-${index}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={stat.color}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={stat.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={stat.color}
                    fillOpacity={1}
                    fill={`url(#color-${index})`}
                    strokeWidth={2}
                    isAnimationActive={true}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Секция последних заказов */}
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-0 sm:p-6">
          <div className="flex items-center justify-between px-6 pt-6 sm:px-0 sm:pt-0 mb-2">
            <h2 className="card-title font-raleway">Последние заказы</h2>
            <Link
              to="/orders"
              className="btn btn-sm btn-ghost text-primary text-xs uppercase font-bold"
            >
              Все заказы
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex justify-center mb-4">
                <ShoppingBagIcon className="w-16 h-16 text-base-content/20" />
              </div>
              <h3 className="text-xl font-bold text-base-content/70">
                Заказы ещё не поступали
              </h3>
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
                  {recentOrders.map((order) => {
                    const customer = order.user || {};
                    let displayName = "Аноним";

                    if (customer.firstName || customer.lastName) {
                      displayName = `${customer.firstName || ""} ${
                        customer.lastName || ""
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
                        className="hover:bg-base-50 transition-colors group"
                      >
                        {/* 1. ID  */}
                        <td>
                          <Link
                            to="/orders"
                            className="btn btn-xs bg-base-200 border-none hover:bg-primary hover:text-white transition-colors text-xs px-2 h-7 min-h-0 font-semibold"
                          >
                            #{order._id.slice(-6).toUpperCase()}
                          </Link>
                        </td>

                        {/* 2. Клиент */}
                        <td className="max-w-50">
                          <div className="flex items-center gap-3">
                            <div className="avatar shrink-0">
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

                            <div className="flex flex-col min-w-0">
                              <Link
                                to="/customers"
                                className="font-semibold text-sm hover:text-primary hover:underline transition-colors block truncate"
                                title="Перейти к клиентам"
                              >
                                {displayName}
                              </Link>

                              <div className="text-xs text-base-content/50 flex items-center gap-1.5 truncate">
                                {order.shippingAddress?.streetAddress ||
                                  order.shippingAddress?.city}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 3. Дата */}
                        <td>
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

                        {/* 4. Товары */}
                        <td>
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

                        {/* 5. Статус */}
                        <td>
                          <div className="relative w-fit">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              disabled={isUpdating}
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

                        {/* 6. Сумма */}
                        <td>
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

export default DashboardPage;
