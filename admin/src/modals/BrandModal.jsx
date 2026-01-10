import { useState, useEffect, useRef } from "react";
import { XIcon, Upload, Trash2, Tag, ImageIcon } from "lucide-react";

export default function BrandModal({
  isOpen,
  onClose,
  brandToEdit,
  onSubmit,
  isLoading,
}) {
  const fileInputRef = useRef(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (brandToEdit) {
        setName(brandToEdit.name || "");
        setDescription(brandToEdit.description || "");
        setImagePreview(brandToEdit.logo || "");
        setImageFile(null);
      } else {
        setName("");
        setDescription("");
        setImagePreview("");
        setImageFile(null);
      }
    }
  }, [isOpen, brandToEdit]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (imageFile) {
      formData.append("image", imageFile);
    }
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open modal-bottom sm:modal-middle tracking-wide">
      <div className="modal-box bg-base-100 rounded-2xl shadow-2xl p-0 w-full max-w-md overflow-hidden">
        {/* Шапка */}
        <div className="bg-base-100 border-b border-base-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <h3 className="font-bold text-xl flex items-center gap-2 font-raleway">
            {brandToEdit ? "Редактирование бренда" : "Новый бренд"}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:bg-base-200"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {/* Логотип */}
          <div className="form-control w-full">
            <label className="label font-semibold text-sm text-base-content/80 mb-1">
              Логотип
            </label>

            <div className="relative group w-full h-40 border-2 border-dashed border-base-300 rounded-2xl hover:border-primary hover:bg-base-50 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden bg-base-200/30">
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-contain p-4"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current.click();
                      }}
                      className="btn btn-sm btn-circle bg-white text-primary border-none hover:bg-white"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage();
                      }}
                      className="btn btn-sm btn-circle btn-error text-white border-none"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-full h-full"
                  onClick={() => fileInputRef.current.click()}
                >
                  <div className="bg-base-100 p-3 rounded-full mb-2 shadow-sm group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6 text-base-content/40" />
                  </div>
                  <span className="text-xs font-bold text-base-content/60">
                    Нажмите для загрузки
                  </span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            <div className="text-center mt-2 space-y-0.5">
              <p className="text-xs text-base-content/50">
                Поддерживаемые форматы: JPEG, JPG, PNG, WEBP
              </p>
              <p className="text-xs text-base-content/50">
                Максимальный размер файла: 5 MB
              </p>
            </div>
          </div>

          {/* Название */}
          <div className="form-control w-full">
            <label className="label font-semibold text-sm text-base-content/80 mb-1">
              Название
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Например: Dior"
                className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                <Tag
                  className="w-4 h-4 text-base-content/40"
                  strokeWidth={2.5}
                />
              </div>
            </div>
          </div>

          {/* 3. Описание (Новое поле) */}
          <div className="form-control w-full">
            <label className="label font-semibold text-sm text-base-content/80 mb-1">
              Описание
            </label>
            <textarea
              className="textarea textarea-bordered h-24 w-full focus:outline-none focus:border-primary resize-none"
              placeholder="Краткое описание бренда..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
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
            className="btn btn-primary min-w-30 shadow-lg shadow-primary/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : brandToEdit ? (
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
  );
}
