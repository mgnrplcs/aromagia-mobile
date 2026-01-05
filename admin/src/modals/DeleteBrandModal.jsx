import { Trash2Icon, XIcon, AlertTriangle, Tag } from "lucide-react";

export default function DeleteBrandModal({
  isOpen,
  onClose,
  onConfirm,
  brand,
  isLoading,
}) {
  if (!isOpen || !brand) return null;

  return (
    <div className="modal tracking-wide modal-open modal-bottom sm:modal-middle">
      <div className="modal-box p-0 w-full max-w-sm overflow-hidden rounded-2xl shadow-2xl bg-base-100">
        <button
          onClick={onClose}
          className="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 z-10 hover:bg-base-200"
          disabled={isLoading}
        >
          <XIcon className="w-5 h-5 text-base-content/50" />
        </button>

        <div className="flex flex-col items-center text-center p-8 pb-6">
          <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center mb-5 ring-8 ring-error/5">
            <Trash2Icon className="w-8 h-8 text-error" strokeWidth={2} />
          </div>

          <h3 className="text-xl font-bold text-base-content font-raleway">
            Удалить бренд?
          </h3>

          <div className="mt-2 text-sm text-base-content/60 w-full">
            Вы собираетесь удалить бренд:
          </div>

          {/* Карточка бренда */}
          <div className="mt-4 w-full bg-base-200/50 border border-base-200 rounded-xl p-3 flex items-center gap-3 text-left">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-white border border-base-200 p-1 flex items-center justify-center">
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Tag className="w-5 h-5 text-base-content/30" />
              )}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="font-semibold text-base-content text-lg leading-tight truncate">
                {brand.name}
              </div>
            </div>
          </div>

          <div className="mt-5 flex items-start gap-2.5 text-xs font-medium text-warning bg-warning/10 px-3 py-2 rounded-lg text-left w-full">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Это действие нельзя отменить</span>
          </div>
        </div>

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
      <div
        className="modal-backdrop bg-black/40"
        onClick={!isLoading ? onClose : undefined}
      ></div>
    </div>
  );
}
