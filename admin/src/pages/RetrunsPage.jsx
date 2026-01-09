import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Link } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Undo2,
  Search,
  Calendar,
  FileText,
  Filter,
  ShoppingBag,
  User,
} from "lucide-react";
import { returnApi } from "../lib/api";
import { formatDate, getReturnStatusColor } from "../lib/utils";
import PageLoader from "../components/PageLoader";

// Опции статусов согласно вашей схеме Mongoose
const RETURN_STATUS_OPTIONS = [
  { value: "Ожидает рассмотрения", label: "Ожидает рассмотрения" },
  { value: "Одобрено", label: "Одобрено" },
  { value: "Отклонено", label: "Отклонено" },
  { value: "Возврат выполнен", label: "Возврат выполнен" },
];

function ReturnsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // --- Загрузка ---
  const { data: returnsData, isLoading } = useQuery({
    queryKey: ["returns"],
    queryFn: async () => {
      const token = await getToken();
      return returnApi.getAll(token);
    },
  });

  // --- Мутация статуса ---
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      const token = await getToken();
      return returnApi.updateStatus({ id, status, adminComment: "" }, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["returns"] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || error.message;
      alert(`Ошибка: ${message}`);
    },
  });

  const handleStatusChange = (id, newStatus) => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const returns = Array.isArray(returnsData) ? returnsData : [];

  // --- Фильтрация ---
  const filteredReturns = returns.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    const returnId = item._id ? item._id.slice(-6).toLowerCase() : "";
    const customerName = item.user
      ? `${item.user.firstName} ${item.user.lastName}`.toLowerCase()
      : "";
    const email = item.user?.email?.toLowerCase() || "";

    return (
      returnId.includes(searchLower) ||
      customerName.includes(searchLower) ||
      email.includes(searchLower)
    );
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 tracking-wide">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <Undo2 className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-raleway">Возвраты</h1>
            <p className="text-base-content/70 text-sm">
              Всего заявок: {returns.length}
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Поиск заявки..."
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
          {filteredReturns.length === 0 ? (
            <div className="text-center py-20 text-base-content/50">
              <div className="flex justify-center mb-2">
                <Undo2 className="w-16 h-16 opacity-20" />
              </div>
              <p className="text-xl font-semibold mb-1">Заявки не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-lg whitespace-nowrap">
                <thead className="bg-base-200/50 text-base-content/70">
                  <tr>
                    <th className="w-px">ID возврата</th>
                    <th className="max-w-50 w-[20%]">Клиент</th>
                    <th>Дата</th>
                    <th>Заказ</th>
                    <th>Причина</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReturns.map((item) => {
                    const customer = item.user || {};
                    const order = item.order || {};

                    // Формируем имя
                    let displayName = "Аноним";
                    if (customer.firstName || customer.lastName) {
                      displayName = `${customer.firstName || ""} ${
                        customer.lastName || ""
                      }`.trim();
                    }

                    const isUpdating =
                      updateStatusMutation.isPending &&
                      updateStatusMutation.variables?.id === item._id;

                    const statusColor = getReturnStatusColor(item.status);

                    return (
                      <tr
                        key={item._id}
                        className="hover:bg-base-50 transition-colors group"
                      >
                        {/* 1. ID */}
                        <td>
                          <div className="font-semibold text-base-content text-xs bg-base-200 px-2 py-1 rounded-md w-fit">
                            #{item._id.slice(-6).toUpperCase()}
                          </div>
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
                            <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-base-content/70" />
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

                        {/* 4. Заказ (Ссылка) */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <ShoppingBag className="w-4 h-4 text-base-content/70" />
                            </div>
                            {order._id ? (
                              <div className="flex flex-col">
                                <span className="font-semibold text-sm">
                                  #{order._id.slice(-6).toUpperCase()}
                                </span>
                                <span className="text-xs text-base-content/50">
                                  {order.totalPrice
                                    ? `${order.totalPrice.toLocaleString()} ₽`
                                    : "Сумма скрыта"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-base-content/50">
                                Не найден
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 5. Причина */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex flex-col max-w-xs">
                              <span
                                className="font-medium text-sm truncate"
                                title={item.reason}
                              >
                                {item.reason}
                              </span>
                              {item.details && (
                                <span
                                  className="text-xs text-base-content/50 truncate"
                                  title={item.details}
                                >
                                  {item.details}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 6. Статус */}
                        <td>
                          <div className="relative w-fit">
                            <select
                              value={item.status}
                              onChange={(e) =>
                                handleStatusChange(item._id, e.target.value)
                              }
                              disabled={isUpdating}
                              className={`select select-sm select-bordered font-bold tracking-wide focus:outline-none pr-8 ${statusColor}`}
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

export default ReturnsPage;
