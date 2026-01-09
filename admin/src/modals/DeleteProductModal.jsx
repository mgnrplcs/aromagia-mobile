import { Trash2Icon, XIcon, AlertTriangle, ImageIcon } from "lucide-react";

export default function DeleteProductModal({
  isOpen,
  onClose,
  onConfirm,
  productName,
  productBrand,
  productImage,
  isLoading,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="modal modal-open tracking-wide modal-bottom sm:modal-middle"
      role="dialog"
    >
      <div className="modal-box p-0 w-full max-w-sm overflow-hidden rounded-2xl shadow-xl bg-base-100">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10"
          disabled={isLoading}
        >
          <XIcon className="w-4 h-4 text-base-content/50" />
        </button>

        <div className="flex flex-col items-center text-center p-7">
          {/* Иконка корзины */}
          <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mb-4.5 ring-8 ring-error/5">
            <Trash2Icon className="w-7 h-7 text-error" strokeWidth={2} />
          </div>

          <h3 className="text-lg font-bold text-base-content mb-1">
            Удалить товар?
          </h3>

          <p className="text-sm text-base-content/60 mb-4">
            Вы собираетесь удалить следующий товар:
          </p>

          {/* Мини-карточка товара */}
          <div className="w-full flex items-center gap-3 bg-base-200/40 border border-base-200 rounded-xl p-3 text-left">
            {/* Картинка */}
            <div className="w-12 h-12 shrink-0 rounded-lg bg-base-100 border border-base-200 overflow-hidden flex items-center justify-center">
              {productImage ? (
                <img
                  src={productImage}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-5 h-5 text-base-content/20" />
              )}
            </div>

            {/* Текст */}
            <div className="min-w-0 mb-0.5 flex-1">
              {productBrand && (
                <p className="text-[13px] text-base-content/50 font-medium truncate">
                  {productBrand}
                </p>
              )}
              <p className="text-sm font-bold text-base-content leading-tight truncate">
                {productName}
              </p>
            </div>
          </div>

          {/* Предупреждение */}
          <div className="mt-3.5 flex items-start gap-2.5 text-xs text-warning bg-warning/10 p-3 rounded-lg text-left w-full">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Это действие нельзя будет отменить</span>
          </div>
        </div>

        {/* Футер */}
        <div className="bg-base-200/30 p-4 grid grid-cols-2 gap-3 border-t border-base-200">
          <button
            onClick={onClose}
            className="btn btn-ghost hover:bg-base-200 font-medium"
            disabled={isLoading}
          >
            Отмена
          </button>

          <button
            onClick={onConfirm}
            className="btn btn-error text-white shadow-sm font-medium"
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

      <div
        className="modal-backdrop bg-black/30"
        onClick={isLoading ? null : onClose}
      ></div>
    </div>
  );
}
