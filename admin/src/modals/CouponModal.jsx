import { useState, useEffect, useRef } from "react";
import {
  XIcon,
  Ticket,
  Calendar,
  Wallet,
  Users,
  ShoppingBag,
  Info,
} from "lucide-react";

const customStyles = `
  /* Убираем стрелочки у input type="number" */
  input[type=number]::-webkit-inner-spin-button, 
  input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    margin: 0; 
  }
  input[type=number] {
    -moz-appearance: textfield;
  }

  /* Настройка для Date Picker */
  input[type="date"]::-webkit-calendar-picker-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

export default function CouponModal({
  isOpen,
  onClose,
  couponToEdit,
  onSubmit,
  isLoading,
}) {
  const dateInputRef = useRef(null);

  const [code, setCode] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(0);
  const [maxUsage, setMaxUsage] = useState(0);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (isOpen) {
      if (couponToEdit) {
        setCode(couponToEdit.code || "");
        setDiscountAmount(couponToEdit.discountAmount || "");
        const dateStr = couponToEdit.validUntil
          ? new Date(couponToEdit.validUntil).toISOString().split("T")[0]
          : "";
        setValidUntil(dateStr);
        setMinPurchaseAmount(couponToEdit.minPurchaseAmount || 0);
        setMaxUsage(couponToEdit.maxUsage || 0);
        setIsActive(
          couponToEdit.isActive !== undefined ? couponToEdit.isActive : true
        );
      } else {
        setCode("");
        setDiscountAmount("");
        setValidUntil("");
        setMinPurchaseAmount(0);
        setMaxUsage(0);
        setIsActive(true);
      }
    }
  }, [isOpen, couponToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      code: code.toUpperCase(),
      discountAmount: Number(discountAmount),
      validUntil,
      minPurchaseAmount: Number(minPurchaseAmount),
      maxUsage: Number(maxUsage),
      isActive,
    };

    onSubmit(data);
  };

  const openDatePicker = () => {
    if (dateInputRef.current) {
      dateInputRef.current.showPicker();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{customStyles}</style>

      <div className="modal modal-open modal-bottom sm:modal-middle tracking-wide">
        <div className="modal-box bg-base-100 rounded-2xl shadow-2xl p-0 w-full max-w-lg overflow-hidden">
          {/* Шапка */}
          <div className="bg-base-100 border-b border-base-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
            <h3 className="font-bold text-xl flex items-center gap-2 font-raleway">
              {couponToEdit ? "Редактирование купона" : "Новый промокод"}
            </h3>
            <button
              onClick={onClose}
              className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:bg-base-200"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Код купона */}
            <div className="form-control w-full">
              <label className="label font-bold text-sm text-base-content/80 mb-1">
                Код купона
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="SUMMER2024"
                  className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary uppercase text-sm font-medium tracking-wider"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
                <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                  <Ticket
                    className="w-4 h-4 text-base-content/40"
                    strokeWidth={2.5}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Сумма скидки */}
              <div className="form-control w-full">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Скидка (₽)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="500"
                    className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary font-medium"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    min="0"
                    required
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                    <Wallet
                      className="w-4 h-4 text-base-content/40"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>

              {/* Срок действия */}
              <div className="form-control w-full">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Действует до
                </label>
                <div
                  className="relative cursor-pointer"
                  onClick={openDatePicker}
                >
                  <input
                    ref={dateInputRef}
                    type="date"
                    className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary font-medium cursor-pointer"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    required
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                    <Calendar
                      className="w-4 h-4 text-base-content/40"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="divider my-2"></div>

            <div className="grid grid-cols-2 gap-4">
              {/* Мин сумма заказа */}
              <div className="form-control w-full">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Мин. сумма заказа
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary font-medium"
                    value={minPurchaseAmount}
                    onChange={(e) => setMinPurchaseAmount(e.target.value)}
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                    <ShoppingBag
                      className="w-4 h-4 text-base-content/40"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <label className="label pt-1 pb-0">
                  <span className="label-text-alt text-xs text-base-content/50">
                    0 = без ограничений
                  </span>
                </label>
              </div>

              {/* Макс использований */}
              <div className="form-control w-full">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Лимит использований
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0"
                    className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary font-medium"
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(e.target.value)}
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                    <Users
                      className="w-4 h-4 text-base-content/40"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
                <label className="label pt-1 pb-0">
                  <span className="label-text-alt text-xs text-base-content/50">
                    0 = бесконечно
                  </span>
                </label>
              </div>
            </div>

            {/* Активность */}
            <div className="bg-base-200/50 p-4 rounded-xl border border-base-200 flex items-center justify-between mt-2">
              <div className="flex gap-3 items-center">
                <div
                  className={`p-2.5 rounded-xl ${
                    isActive
                      ? "bg-success/10 text-success"
                      : "bg-base-300 text-base-content/40"
                  }`}
                >
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-base-content">
                    Статус промокода
                  </span>
                  <span className="text-xs text-base-content/60 font-medium">
                    {isActive
                      ? "Доступен для использования"
                      : "Скрыт от клиентов"}
                  </span>
                </div>
              </div>

              <input
                type="checkbox"
                className="toggle toggle-success toggle-md"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </div>
          </form>

          {/* Футер */}
          <div className="bg-base-100 border-t border-base-200 p-4 flex justify-end gap-3 z-10 sticky bottom-0">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost hover:bg-base-200 font-medium"
              disabled={isLoading}
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              className="btn btn-primary min-w-32 shadow-lg shadow-primary/20"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : couponToEdit ? (
                "Сохранить"
              ) : (
                "Создать"
              )}
            </button>
          </div>
        </div>

        <div
          className="modal-backdrop bg-black/40"
          onClick={!isLoading ? onClose : undefined}
        ></div>
      </div>
    </>
  );
}
