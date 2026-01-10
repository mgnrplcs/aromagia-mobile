import { XIcon, ImageIcon, FileText } from "lucide-react";

export default function ReturnDetailsModal({
  isOpen,
  onClose,
  images = [],
  details = "",
}) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle tracking-wide">
      <div className="modal-box bg-base-100 rounded-2xl shadow-2xl p-0 w-full max-w-2xl overflow-hidden">
        {/* Шапка */}
        <div className="bg-base-100 border-b border-base-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <h3 className="font-bold text-xl flex items-center gap-2 font-raleway">
            Детали возврата
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:bg-base-200"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Секция: Фотографии */}
          <div className="form-control w-full">
            <label className="label font-semibold text-sm text-base-content/80 mb-1">
              Фотографии ({images.length})
            </label>

            {images.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="group relative aspect-square rounded-2xl border-2 border-base-200 overflow-hidden cursor-pointer hover:border-primary transition-colors bg-base-50"
                    onClick={() => window.open(img, "_blank")}
                  >
                    <img
                      src={img}
                      alt={`Evidence ${i + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500"
                    />

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                      <div className="bg-base-200 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <ImageIcon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="w-full h-32 border-2 border-dashed border-base-300 rounded-2xl bg-base-200/30 flex flex-col items-center justify-center text-base-content/50 gap-2">
                <ImageIcon className="w-8 h-8 opacity-40" />
                <span className="text-xs font-medium">
                  Нет прикрепленных фото
                </span>
              </div>
            )}
          </div>

          {/* Секция: Описание */}
          <div className="form-control w-full">
            <label className="label font-semibold text-sm text-base-content/80 mb-1">
              Описание от клиента
            </label>
            <div className="relative">
              <div className="min-h-30 w-full border border-base-300 rounded-xl p-3 bg-base-50 text-base-content/80 text-sm leading-relaxed whitespace-pre-wrap">
                {details ? (
                  details
                ) : (
                  <span className="text-base-content/40 italic flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-base-300"></span>
                    Описание не предоставлено
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Футер */}
        <div className="bg-base-100 border-t border-base-200 p-4 flex justify-end z-10 sticky bottom-0">
          <button
            onClick={onClose}
            className="btn btn-primary min-w-32 shadow-lg shadow-primary/20 font-medium"
          >
            Закрыть
          </button>
        </div>
      </div>

      <div className="modal-backdrop bg-black/40" onClick={onClose}></div>
    </div>
  );
}
