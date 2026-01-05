import { Trash2Icon, XIcon, AlertTriangle, User } from "lucide-react";

export default function DeleteCustomerModal({
  isOpen,
  onClose,
  onConfirm,
  customer,
  isLoading,
}) {
  if (!isOpen || !customer) return null;

  const fullName =
    `${customer.firstName || ""} ${customer.lastName || ""}`.trim() ||
    "Без имени";

  return (
    <div
      className="modal tracking-wide modal-open modal-bottom sm:modal-middle"
      role="dialog"
    >
      <div className="modal-box p-0 w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl bg-base-100">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-base-200"
          disabled={isLoading}
        >
          <XIcon className="w-5 h-5 text-base-content/50" />
        </button>

        <div className="flex flex-col items-center text-center p-8 pb-6">
          {/* 1. Главная иконка: Только Корзина */}
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-5 ring-8 ring-error/5">
            <Trash2Icon className="w-8 h-8 text-error" strokeWidth={2} />
          </div>

          <h3 className="text-xl font-bold text-base-content font-raleway">
            Удалить клиента?
          </h3>

          <div className="mt-2 text-sm text-base-content/60 w-full">
            Вы собираетесь удалить пользователя:
          </div>

          {/* 2. Карточка клиента: Аватар слева + Данные */}
          <div className="mt-4 w-full bg-base-200/50 border border-base-200 rounded-xl p-3 flex items-center gap-3 text-left">
            {/* Аватар */}
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full bg-base-100 ring-1 ring-base-300 flex items-center justify-center overflow-hidden">
                {customer.imageUrl ? (
                  <img
                    src={customer.imageUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-base-content/30" />
                )}
              </div>
            </div>

            {/* Текст */}
            <div className="overflow-hidden min-w-0">
              <div className="font-bold text-base-content text-base leading-tight truncate">
                {fullName}
              </div>
              <div className="text-xs font-medium text-base-content/50 truncate mt-0.5">
                {customer.email}
              </div>
            </div>
          </div>

          {/* 3. Предупреждение */}
          <div className="mt-5 flex items-start gap-2.5 text-xs font-medium text-warning bg-warning/10 px-3 py-2 rounded-lg text-left w-full">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Это действие нельзя отменить</span>
          </div>
        </div>

        {/* Кнопки */}
        <div className="bg-base-50/50 p-4 grid grid-cols-2 gap-3 border-t border-base-200">
          <button
            onClick={onClose}
            className="btn btn-ghost hover:bg-base-200 font-medium"
            disabled={isLoading}
          >
            Отмена
          </button>

          <button
            onClick={onConfirm}
            className="btn btn-error shadow-lg shadow-error/20 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Удалить"
            )}
          </button>
        </div>
      </div>

      {/* Затемнение */}
      <div
        className="modal-backdrop bg-black/40"
        onClick={!isLoading ? onClose : undefined}
      ></div>
    </div>
  );
}
