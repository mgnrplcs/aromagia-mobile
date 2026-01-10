import { useState } from "react";
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
  Undo2,
  FileText,
  Image as ImageIcon,
  ShoppingBag,
  Check,
  Ban,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { orderApi, statsApi, returnApi } from "../lib/api";
import PageLoader from "../components/PageLoader";
import {
  formatDate,
  getDeclension,
  getOrderStatusColor,
  getReturnStatusColor,
} from "../lib/utils";
import ReturnDetailsModal from "../modals/ReturnDetailsModal";

const ORDER_STATUS_OPTIONS = [
  { value: "В ожидании", label: "В ожидании" },
  { value: "Оплачен", label: "Оплачен" },
  { value: "Отправлен", label: "Отправлен" },
  { value: "Доставлен", label: "Доставлен" },
  { value: "Отменен", label: "Отменен" },
];

const RETURN_STATUS_OPTIONS = [
  { value: "Ожидает рассмотрения", label: "Ожидает рассмотрения" },
  { value: "Одобрено", label: "Возврат одобрен" },
  { value: "Отклонено", label: "Возврат отклонён" },
  { value: "Возврат выполнен", label: "Возврат выполнен" },
];

function DashboardPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState(null);

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

  const { data: returnsData, isLoading: returnsLoading } = useQuery({
    queryKey: ["returns"],
    queryFn: async () => {
      const token = await getToken();
      return returnApi.getAll(token);
    },
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }) => {
      const token = await getToken();
      return orderApi.updateStatus({ orderId, status }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
    onError: (error) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  const updateReturnStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const token = await getToken();
      return returnApi.updateStatus({ id, status, adminComment: "" }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
    },
    onError: (error) => {
      alert(`Ошибка: ${error.message}`);
    },
  });

  const handleOrderStatusChange = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleReturnStatusChange = (id, newStatus) => {
    updateReturnStatusMutation.mutate({ id, status: newStatus });
  };

  const handleOpenDetails = (item) => {
    setSelectedReturn(item);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsModalOpen(false);
    setSelectedReturn(null);
  };

  const recentOrders = ordersData?.orders || [];
  const recentReturns = Array.isArray(returnsData) ? returnsData : [];

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

  if (ordersLoading || statsLoading || returnsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 tracking-wide">
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

      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-0 sm:p-6">
          <div className="flex items-center justify-between px-6 pt-6 sm:px-0 sm:pt-0 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-base-200 rounded-lg text-primary">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="card-title font-raleway">Последние заказы</h2>
            </div>
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
                  {recentOrders.slice(0, 3).map((order) => {
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
                      updateOrderStatusMutation.isPending &&
                      updateOrderStatusMutation.variables?.orderId ===
                        order._id;

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
                          <Link
                            to="/orders"
                            className="btn btn-xs bg-base-200 border-none hover:bg-primary hover:text-white transition-colors text-xs px-2 h-7 min-h-0 font-semibold"
                          >
                            #{order._id.slice(-6).toUpperCase()}
                          </Link>
                        </td>
                        {/* 2. Клиент */}
                        <td className="max-w-50 relative">
                          {order.hasReturnRequested && (
                            <div className="absolute inset-0 z-10 bg-base-100/40 pointer-events-none" />
                          )}
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
                        <td className="relative">
                          {order.hasReturnRequested && (
                            <div className="absolute inset-0 z-10 bg-base-100/40 pointer-events-none" />
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
                        {/* 4. Товары */}
                        <td className="relative">
                          {order.hasReturnRequested &&
                            (() => {
                              let borderColor = "border-primary";
                              let iconColor = "text-primary";
                              let icon = (
                                <Undo2
                                  className={`w-4 h-4 ${iconColor}`}
                                  strokeWidth={2.5}
                                />
                              );
                              let text = "Запрошен возврат";

                              if (order.returnStatus === "Возврат выполнен") {
                                borderColor = "border-primary";
                                iconColor = "text-primary";
                                icon = (
                                  <Check
                                    className={`w-4 h-4 ${iconColor}`}
                                    strokeWidth={3}
                                  />
                                );
                                text = "Возврат выполнен";
                              } else if (order.returnStatus === "Отклонено") {
                                borderColor = "border-secondary";
                                iconColor = "text-secondary";
                                icon = (
                                  <Ban
                                    className={`w-4 h-4 ${iconColor}`}
                                    strokeWidth={2.5}
                                  />
                                );
                                text = "Возврат отклонен";
                              } else if (order.returnStatus === "Одобрено") {
                                borderColor = "border-primary";
                                iconColor = "text-primary";
                                icon = (
                                  <Check
                                    className={`w-4 h-4 ${iconColor}`}
                                    strokeWidth={3}
                                  />
                                );
                                text = "Возврат одобрен";
                              }

                              return (
                                <div className="absolute inset-0 z-10 bg-base-100/40 pointer-events-none flex items-center justify-center">
                                  <Link
                                    to="/returns"
                                    className={`btn btn-sm bg-base-200 ${borderColor} border-2 hover:bg-base-300 -translate-x-34 shadow-xl gap-1.5 pointer-events-auto z-20`}
                                  >
                                    {icon}
                                    <span className="text-base-content font-bold">
                                      {text}
                                    </span>
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
                        {/* 5. Статус */}
                        <td className="relative">
                          {order.hasReturnRequested && (
                            <div className="absolute inset-0 z-10 bg-base-100/40 pointer-events-none" />
                          )}
                          <div className="relative w-fit">
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleOrderStatusChange(
                                  order._id,
                                  e.target.value
                                )
                              }
                              disabled={isUpdating || order.hasReturnRequested}
                              className={`select select-sm select-bordered font-bold tracking-wide focus:outline-none pr-8 ${statusColor}`}
                            >
                              {ORDER_STATUS_OPTIONS.map((opt) => (
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

      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-0 sm:p-6">
          <div className="flex items-center justify-between px-6 pt-6 sm:px-0 sm:pt-0 mb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-base-200 rounded-lg text-primary">
                <Undo2 className="w-5 h-5" strokeWidth={2.5} />
              </div>
              <h2 className="card-title font-raleway">Последние возвраты</h2>
            </div>
            <Link
              to="/returns"
              className="btn btn-sm btn-ghost text-primary text-xs uppercase font-bold"
            >
              Все возвраты
            </Link>
          </div>

          {recentReturns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex justify-center mb-4">
                <Undo2 className="w-16 h-16 text-base-content/20" />
              </div>
              <h3 className="text-xl font-bold text-base-content/70">
                Заявки на возврат отсутствуют
              </h3>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-lg whitespace-nowrap">
                <thead className="bg-base-200/50 text-base-content/70">
                  <tr>
                    <th className="w-38">ID возврата</th>
                    <th className="w-74">Клиент</th>
                    <th className="w-50">Дата</th>
                    <th>Заказ</th>
                    <th>Причина / Товары</th>
                    <th>Статус</th>
                    <th className="sticky">Подробности</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReturns.slice(0, 3).map((item) => {
                    const customer = item.user || {};
                    const order = item.order || {};
                    let displayName = "Аноним";
                    if (customer.firstName || customer.lastName) {
                      displayName = `${customer.firstName || ""} ${
                        customer.lastName || ""
                      }`.trim();
                    }
                    const isUpdating =
                      updateReturnStatusMutation.isPending &&
                      updateReturnStatusMutation.variables?.id === item._id;
                    const statusColor = getReturnStatusColor(item.status);

                    return (
                      <tr
                        key={item._id}
                        className="hover:bg-base-50 transition-colors group"
                      >
                        {/* 1. ID */}
                        <td>
                          <Link
                            to="/returns"
                            className="btn btn-xs bg-base-200 border-none hover:bg-primary hover:text-white transition-colors text-xs px-2 h-7 min-h-0 font-semibold"
                          >
                            #{item._id.slice(-6).toUpperCase()}
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
                              <div className="text-xs text-base-content/50 truncate">
                                {customer.email}
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
                                {item.createdAt
                                  ? formatDate(item.createdAt).split(",")[0]
                                  : "-"}
                              </span>
                              <span className="text-xs text-base-content/50">
                                {item.createdAt
                                  ? formatDate(item.createdAt).split(",")[1]
                                  : ""}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Заказ */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <ShoppingBagIcon className="w-5 h-5 text-base-content/70" />
                            </div>
                            {order._id ? (
                              <div className="flex flex-col">
                                <Link
                                  to={`/orders?search=${order._id
                                    .slice(-6)
                                    .toUpperCase()}`}
                                  className="font-semibold text-sm hover:text-primary hover:underline transition-colors flex items-center gap-1"
                                >
                                  #{order._id.slice(-6).toUpperCase()}
                                </Link>
                                <span className="text-xs text-base-content/50">
                                  {order.totalPrice
                                    ? `${order.totalPrice.toLocaleString(
                                        "ru-RU"
                                      )} ₽`
                                    : "0 ₽"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-base-content/50">
                                Не найден
                              </span>
                            )}
                          </div>
                        </td>
                        {/* 5. Причина  */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col max-w-xs">
                              <span className="font-bold text-sm truncate">
                                {item.reason}
                              </span>
                              <span
                                className="text-xs text-base-content/50 truncate"
                                title={item.reason}
                              >
                                {item.items?.[0]?.product?.name ||
                                  "Товар удален"}
                                {item.items?.length > 1 &&
                                  `, (+${item.items.length - 1})`}
                              </span>
                            </div>
                          </div>
                        </td>
                        {/* 6. Статус */}
                        <td>
                          <div className="relative w-full">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleReturnStatusChange(
                                  item._id,
                                  e.target.value
                                )
                              }
                              disabled={isUpdating}
                              className={`select select-sm select-bordered w-full font-bold tracking-wide focus:outline-none pr-8 ${statusColor}`}
                            >
                              {RETURN_STATUS_OPTIONS.map((opt) => (
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
                        {/* 7. Подробности */}
                        <td className="sticky right-0 z-10 text-center">
                          <button
                            onClick={() => handleOpenDetails(item)}
                            className="btn btn-sm btn-ghost border border-base-300 hover:border-primary hover:text-primary gap-2.5 rounded-lg"
                          >
                            <ImageIcon className="w-4 h-4" />
                            Просмотр
                            {item.images?.length > 0 && (
                              <span className="badge badge-primary badge-sm text-[11px] px-1.5 h-4 w-4">
                                {item.images.length}
                              </span>
                            )}
                          </button>
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

      <ReturnDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetails}
        images={selectedReturn?.images}
        details={selectedReturn?.details}
      />
    </div>
  );
}

export default DashboardPage;
