import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ticket,
  Search,
  Plus,
  Trash2Icon,
  PencilIcon,
  Calendar,
  Wallet,
  Users,
  Filter,
  Megaphone,
} from "lucide-react";
import { couponApi } from "../lib/api";
import { formatDate } from "../lib/utils";
import PageLoader from "../components/PageLoader";

// Импорт модалок
import CouponModal from "../modals/CouponModal";
import DeleteCouponModal from "../modals/DeleteCouponModal";

function CouponsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Состояния для модалок
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deletingCoupon, setDeletingCoupon] = useState(null);

  // --- 1. Загрузка ---
  const { data: couponsData, isLoading } = useQuery({
    queryKey: ["coupons"],
    queryFn: async () => {
      const token = await getToken();
      return couponApi.getAll(token);
    },
  });

  // --- 2. Создание ---
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      return couponApi.create(data, token);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message;
      alert(`Ошибка: ${msg}`);
    },
  });

  // --- 3. Удаление ---
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      return couponApi.delete(id, token);
    },
    onSuccess: () => {
      setDeletingCoupon(null);
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message || err.message;
      alert(`Ошибка: ${msg}`);
    },
  });

  // --- 4. Обновление ---
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const token = await getToken();
      return couponApi.update({ id, formData: data }, token);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setEditingCoupon(null);
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err) => alert(err.response?.data?.message || err.message),
  });

  // --- 5. Переключение активности ---
  const toggleActiveMutation = useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      return couponApi.toggleActive(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
    },
    onError: (err) => alert(err.message),
  });

  // Обработчики
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingCoupon) {
      deleteMutation.mutate(deletingCoupon._id);
    }
  };

  const coupons = Array.isArray(couponsData) ? couponsData : [];
  const filteredCoupons = coupons.filter((c) =>
    c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6 tracking-wide">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <Ticket className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-raleway">Промокоды</h1>
            <p className="text-base-content/70 text-sm">
              Всего активных: {coupons.filter((c) => c.isActive).length}
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Поиск промокода..."
              className="input input-bordered w-full pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-base-content/50" />
          </div>

          <button className="btn btn-square btn-ghost border border-base-200">
            <Filter className="w-5 h-5 text-base-content" />
          </button>

          <button
            onClick={handleOpenCreate}
            className="btn btn-outline btn-primary gap-1.5"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline mb-0.5">Добавить</span>
          </button>
        </div>
      </div>

      {/* Таблица */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body p-0">
          {filteredCoupons.length === 0 ? (
            <div className="text-center py-20 text-base-content/50">
              <div className="flex justify-center mb-2">
                <Ticket className="w-16 h-16 opacity-20" />
              </div>
              <p className="text-xl font-semibold mb-1">Промокоды не найдены</p>
              <p className="text-sm opacity-60">
                Создайте новый купон, чтобы привлечь клиентов
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-lg whitespace-nowrap">
                <thead className="bg-base-200/50 text-base-content/70">
                  <tr>
                    <th className="w-55">Код</th>
                    <th className="w-85">Скидка</th>
                    <th>Использование</th>
                    <th>Срок действия</th>
                    <th className="w-50">Статус</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.map((coupon) => {
                    // Вычисления оставляем для тултипа и проверки истечения срока (красный текст даты)
                    const isExpired = new Date(coupon.validUntil) < new Date();
                    const isLimitReached =
                      coupon.maxUsage > 0 &&
                      coupon.usedCount >= coupon.maxUsage;

                    // Упрощенная логика статуса:
                    const statusText = coupon.isActive ? "Активен" : "Выключен";
                    const statusColor = coupon.isActive ? "text-success" : "text-base-content/40";

                    return (
                      <tr
                        key={coupon._id}
                        className="hover:bg-base-50 transition-colors group"
                      >
                        {/* 1. Код */}
                        <td>
                          <div className="font-mono font-bold text-sm bg-base-200 px-3 py-1.5 rounded-lg w-fit select-all border border-base-300">
                            {coupon.code}
                          </div>
                        </td>

                        {/* 2. Скидка и Условия */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <Wallet className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-base">
                                {coupon.discountAmount} ₽
                              </span>
                              {coupon.minPurchaseAmount > 0 ? (
                                <span className="text-xs text-base-content/50">
                                  при заказе от {coupon.minPurchaseAmount} ₽
                                </span>
                              ) : (
                                <span className="text-xs text-base-content/50">
                                  без минимальной суммы
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Использование */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <Users className="w-5 h-5 text-base-content/70" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm">
                                {coupon.usedCount} раз
                              </span>
                              <span className="text-xs text-base-content/50">
                                {coupon.maxUsage > 0
                                  ? `из ${coupon.maxUsage} доступных`
                                  : "безлимитный"}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Срок действия */}
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center shrink-0">
                              <Calendar className="w-5 h-5 text-base-content/70" />
                            </div>
                            <div className="flex flex-col">
                              <span
                                className={`font-medium text-sm ${isExpired ? "text-error" : ""
                                  }`}
                              >
                                {formatDate(coupon.validUntil).split(",")[0]}
                              </span>
                              <span className="text-xs text-base-content/50">
                                до {formatDate(coupon.validUntil).split(",")[1]}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 5. Статус (ИЗМЕНЕНО) */}
                        <td>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="toggle toggle-sm toggle-success"
                              checked={coupon.isActive}
                              onChange={() =>
                                toggleActiveMutation.mutate(coupon._id)
                              }
                              disabled={toggleActiveMutation.isPending}
                            />
                            <div
                              className={`text-xs font-bold ml-1 ${statusColor}`}
                            >
                              {statusText}
                            </div>

                            {/* Подсказка (Megaphone) остается, чтобы объяснить проблему */}
                            {(isExpired || isLimitReached) &&
                              coupon.isActive && (
                                <div
                                  className="tooltip tooltip-left sm:tooltip-top"
                                  data-tip={
                                    isExpired
                                      ? "Срок действия истек"
                                      : "Лимит использований исчерпан"
                                  }
                                >
                                  <Megaphone className="w-4 h-4 text-warning cursor-help" />
                                </div>
                              )}
                          </div>
                        </td>

                        {/* 6. Действия */}
                        <td className="text-right">
                          <div className="flex flex-row items-center justify-end  gap-2 mt-2 sm:mt-0 sm:self-center">
                            <button
                              className="btn btn-square btn-ghost border border-base-200 hover:border-primary hover:text-primary"
                              onClick={() => handleOpenEdit(coupon)}
                              title="Редактировать"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              className="btn btn-square btn-ghost border border-base-200 hover:border-error hover:text-error hover:bg-error/10"
                              onClick={() => setDeletingCoupon(coupon)}
                              title="Удалить"
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

      {/* Модалка создания */}
      <CouponModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        isLoading={isSaving}
        couponToEdit={editingCoupon}
      />

      {/* Модалка удаления */}
      <DeleteCouponModal
        isOpen={!!deletingCoupon}
        onClose={() => setDeletingCoupon(null)}
        onConfirm={handleConfirmDelete}
        coupon={deletingCoupon}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CouponsPage;