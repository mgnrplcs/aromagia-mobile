import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  Search,
  MapPin,
  Heart,
  Mail,
  Calendar,
  User,
  Trash2Icon,
  PencilIcon,
  Filter,
} from "lucide-react";
import { customerApi } from "../lib/api";
import { formatDate, getDeclension } from "../lib/utils";
import PageLoader from "../components/PageLoader";
import EditCustomerModal from "../modals/EditCustomerModal";
import DeleteCustomerModal from "../modals/DeleteCustomerModal";

function CustomersPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Состояния модалок
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);

  // Загрузка
  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: async () => {
      const token = await getToken();
      return customerApi.getAll(token);
    },
  });

  // Мутация редактирования
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const token = await getToken();
      return customerApi.update({ id, formData }, token);
    },
    onSuccess: () => {
      setEditingCustomer(null);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => alert(err.message),
  });

  // Мутация удаления
  const deleteCustomerMutation = useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      return customerApi.delete(id, token);
    },
    onSuccess: () => {
      setDeletingCustomer(null);
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (err) => alert(err.message),
  });

  const handleUpdate = (formData) => {
    if (editingCustomer) {
      updateCustomerMutation.mutate({
        id: editingCustomer._id,
        formData,
      });
    }
  };

  const handleConfirmDelete = () => {
    if (deletingCustomer) {
      deleteCustomerMutation.mutate(deletingCustomer._id);
    }
  };

  const customers = data?.customers || [];

  const filteredCustomers = customers.filter((customer) => {
    const fullName = `${customer.firstName || ""} ${
      customer.lastName || ""
    }`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();

    return (
      fullName.includes(searchLower) ||
      customer.email?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl shadow-sm">
        {/* Левая часть: Заголовок */}
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-raleway">Клиенты</h1>
            <p className="text-base-content/70 text-sm">
              Всего клиентов: {customers.length}
            </p>
          </div>
        </div>

        {/* Правая часть: Поиск и Фильтр */}
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Поиск по имени или email..."
              className="input input-bordered w-full pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-base-content/50" />
          </div>
          {/* Кнопка фильтра */}
          <button className="btn btn-square btn-ghost border border-base-200">
            <Filter className="w-5 h-5 text-base-content" />
          </button>
        </div>
      </div>

      {/* Таблица */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-0">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-20 text-base-content/50">
              <div className="flex justify-center mb-4">
                <Users className="w-16 h-16 opacity-20" />
              </div>
              <p className="text-xl font-semibold mb-1">Клиенты не найдены</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-lg whitespace-nowrap">
                <thead className="bg-base-200/50 text-base-content/70">
                  <tr>
                    <th>Клиент</th>
                    <th>Электронная почта</th>
                    <th>Дата регистрации</th>
                    <th className="text-center">Адресы</th>
                    <th className="text-center">Избранное</th>
                    <th className="text-right"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => {
                    const addressesCount = customer.addresses?.length || 0;
                    const wishlistCount = customer.wishlist?.length || 0;

                    return (
                      <tr
                        key={customer._id}
                        className="hover:bg-base-50 transition-colors group"
                      >
                        {/* Клиент */}
                        <td>
                          <div className="flex items-center gap-3">
                            {/* Обертка для позиционирования */}
                            <div className="relative">
                              <div className="avatar">
                                <div className="w-12 h-12 rounded-full ring-1 ring-base-200 bg-base-100 flex items-center justify-center overflow-hidden">
                                  {customer.imageUrl ? (
                                    <img
                                      src={customer.imageUrl}
                                      alt={customer.firstName}
                                      className="object-cover"
                                    />
                                  ) : (
                                    <User className="w-6 h-6 text-base-content/30" />
                                  )}
                                </div>
                              </div>

                              {/* ⚙️ БЕЙДЖ АДМИНА */}
                              {customer.role === "admin" && (
                                <div
                                  className="absolute -bottom-1 -right-1 w-5.5 h-5.5 rounded-full bg-base-300 border border-base-100 flex items-center justify-center shadow-sm z-10"
                                  title="Администратор"
                                >
                                  <span className="text-xs leading-none select-none">
                                    ⚙️
                                  </span>
                                </div>
                              )}
                            </div>

                            <div>
                              <div className="font-bold text-base">
                                {customer.firstName || customer.lastName
                                  ? `${customer.firstName} ${customer.lastName}`.trim()
                                  : "Без имени"}
                              </div>
                              <div className="text-xs text-base-content/50 font-thin mt-0.5">
                                ID: {customer._id.slice(-6).toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Электронная почта */}
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <Mail className="w-4 h-4 text-base-content/70" />
                            </div>
                            <span className="font-medium text-base-content/80">
                              {customer.email}
                            </span>
                          </div>
                        </td>

                        {/* Дата регистрации */}
                        <td>
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-base-content/70" />
                            </div>
                            <span className="font-medium text-base-content/80">
                              {formatDate(customer.createdAt)}
                            </span>
                          </div>
                        </td>

                        {/* Адреса */}
                        <td className="text-center">
                          <div className="badge badge-ghost gap-2 py-3 px-4">
                            <MapPin
                              className="w-3.5 h-3.5 text-primary"
                              strokeWidth={2.5}
                            />
                            <span className="font-medium mb-0.5">
                              {addressesCount}{" "}
                              {getDeclension(addressesCount, [
                                "адрес",
                                "адреса",
                                "адресов",
                              ])}
                            </span>
                          </div>
                        </td>

                        {/* Избранное */}
                        <td className="text-center">
                          <div className="badge badge-ghost gap-2 py-3 px-4">
                            <Heart
                              className="w-3.5 h-3.5 text-error"
                              strokeWidth={2.5}
                            />
                            <span className="font-medium mb-0.5">
                              {wishlistCount}{" "}
                              {getDeclension(wishlistCount, [
                                "товар",
                                "товара",
                                "товаров",
                              ])}
                            </span>
                          </div>
                        </td>

                        {/* Кнопки действий */}
                        <td className="text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              className="btn btn-square btn-ghost border border-base-200 hover:border-primary hover:text-primary"
                              onClick={() => setEditingCustomer(customer)}
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              className="btn btn-square btn-ghost border border-base-200 hover:border-error hover:text-error hover:bg-error/10"
                              onClick={() => setDeletingCustomer(customer)}
                            >
                              <Trash2Icon className="w-5 h-5" />
                            </button>
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

      {/* Модалки */}
      <EditCustomerModal
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        customer={editingCustomer}
        onSubmit={handleUpdate}
        isLoading={updateCustomerMutation.isPending}
      />

      <DeleteCustomerModal
        isOpen={!!deletingCustomer}
        onClose={() => setDeletingCustomer(null)}
        onConfirm={handleConfirmDelete}
        customer={deletingCustomer}
        isLoading={deleteCustomerMutation.isPending}
      />
    </div>
  );
}

export default CustomersPage;
