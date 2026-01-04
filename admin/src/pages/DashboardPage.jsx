import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { RussianRuble, ShoppingBagIcon, UserIcon, Package } from "lucide-react";
import { orderApi, statsApi } from "../lib/api";

import { getOrderStatusBadge, formatDate } from "../lib/utils";

function DashboardPage() {
  const { getToken } = useAuth();

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

  const recentOrders = ordersData?.orders || [];

  const statsCards = [
    {
      name: "Общая выручка",
      value: statsLoading
        ? "..."
        : `${statsData?.totalRevenue?.toLocaleString("ru-RU") || 0} ₽`,
      icon: <RussianRuble className="size-8" />,
    },
    {
      name: "Всего заказов",
      value: statsLoading ? "..." : statsData?.totalOrders || 0,
      icon: <ShoppingBagIcon className="size-8" />,
    },
    {
      name: "Клиенты",
      value: statsLoading ? "..." : statsData?.totalCustomers || 0,
      icon: <UserIcon className="size-8" />,
    },
    {
      name: "Товары",
      value: statsLoading ? "..." : statsData?.totalProducts || 0,
      icon: <Package className="size-8" />,
    },
  ];

  if (ordersLoading || statsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* STATS */}
      <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100">
        {statsCards.map((stat) => (
          <div key={stat.name} className="stat">
            <div className="stat-figure text-primary">{stat.icon}</div>
            <div className="stat-title text-base-content/60 font-medium">
              {stat.name}
            </div>
            <div className="stat-value text-2xl">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* RECENT ORDERS */}
      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body p-0 sm:p-6">
          <h2 className="card-title px-6 pt-6 sm:px-0 sm:pt-0 mb-4">
            Последние заказы
          </h2>

          {recentOrders.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              Заказов пока нет
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr className="bg-base-200/50 text-base-content">
                    <th>ID заказа</th>
                    <th>Клиент</th>
                    <th>Товары</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                    <th>Дата</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-base-200/20">
                      <td>
                        <span className="font-mono font-medium text-xs opacity-70">
                          #{order._id.slice(-6).toUpperCase()}
                        </span>
                      </td>

                      <td>
                        <div>
                          <div className="font-bold text-sm">
                            {order.user?.firstName} {order.user?.lastName}
                          </div>
                          <div className="text-xs opacity-50">
                            {order.user?.email}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="text-sm font-medium">
                          {order.orderItems[0]?.product?.name || "Товар удален"}
                          {order.orderItems.length > 1 && (
                            <span className="text-xs opacity-60 ml-1">
                              +{order.orderItems.length - 1} еще
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="font-bold font-mono">
                          {order.totalPrice?.toLocaleString("ru-RU")} ₽
                        </span>
                      </td>

                      <td>
                        {/* ИСПОЛЬЗУЕМ ФУНКЦИЮ ИЗ UTILS */}
                        <div
                          className={`badge badge-sm font-medium ${getOrderStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </div>
                      </td>

                      <td>
                        {/* ИСПОЛЬЗУЕМ ФУНКЦИЮ ИЗ UTILS */}
                        <span className="text-xs font-medium opacity-60">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                    </tr>
                  ))}
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
