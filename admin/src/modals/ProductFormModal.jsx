import { useState, useEffect } from "react";
import {
  XIcon,
  ImageIcon,
  Trash2Icon,
  Pyramid,
  Palette,
  Flame,
  Tag,
  CreditCard,
  Package,
  Layers,
  Beaker,
} from "lucide-react";

const initialFormState = {
  name: "",
  brand: "",
  description: "",
  price: "",
  volume: "",
  stock: "",
  category: "",
  gender: "Унисекс",
  scentFamily: "",
  concentration: "Парфюмерная вода",
  notesPyramid: { top: "", middle: "", base: "" },
  isBestseller: false,
};

export default function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  brands,
  onSubmit,
  isLoading,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        setFormData({
          name: productToEdit.name,
          brand: productToEdit.brand?._id || productToEdit.brand || "",
          description: productToEdit.description,
          price: productToEdit.price,
          volume: productToEdit.volume,
          stock: productToEdit.stock,
          category: productToEdit.category,
          gender: productToEdit.gender,
          scentFamily: productToEdit.scentFamily,
          concentration: productToEdit.concentration,
          notesPyramid: {
            top: productToEdit.notesPyramid?.top || "",
            middle: productToEdit.notesPyramid?.middle || "",
            base: productToEdit.notesPyramid?.base || "",
          },
          isBestseller: productToEdit.isBestseller || false,
        });
        setImagePreviews(productToEdit.images || []);
        setImages([]);
      } else {
        setFormData(initialFormState);
        setImages([]);
        setImagePreviews([]);
      }
    }
  }, [isOpen, productToEdit]);

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\s/g, "");
    if (rawValue && isNaN(rawValue)) return;
    setFormData({ ...formData, price: rawValue });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 8) return alert("Максимум 8 изображений");

    imagePreviews.forEach((url) => {
      if (url && url.startsWith("blob:")) URL.revokeObjectURL(url);
    });

    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!productToEdit && images.length === 0) return alert("Загрузите фото");

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === "notesPyramid") {
        formDataToSend.append(
          "notesPyramid",
          JSON.stringify(formData.notesPyramid)
        );
      } else if (key !== "images") {
        formDataToSend.append(key, formData[key]);
      }
    });

    images.forEach((image) => formDataToSend.append("images", image));
    onSubmit(formDataToSend);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal modal-open modal-bottom sm:modal-middle"
      role="dialog"
    >
      <style>{`
        /* Скроллбар */
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 20px;
          border: 3px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #9ca3af; }

        /* Убираем стрелочки (спиннеры) у input type="number" */
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div className="modal-box w-11/12 max-w-3xl max-h-[85vh] tracking-wide p-0 flex flex-col bg-base-100 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Шапка */}
        <div className="bg-base-100 border-b border-base-200 px-6 py-4 flex justify-between items-center z-10 sticky top-0">
          <h3 className="font-bold text-xl">
            {productToEdit
              ? `Редактирование: ${productToEdit.name}`
              : "Новый товар"}
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:text-base-content hover:bg-base-200"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Контент */}
        <div className="overflow-y-auto custom-scrollbar px-6 py-5 scroll-smooth">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
            {/* Блок 1: Основное */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Название товара
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary"
                    placeholder="Например: Sauvage"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
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

              <div className="form-control w-full">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Бренд
                </label>
                <select
                  className="select select-bordered w-full focus:outline-none focus:ring-0 focus:border-primary"
                  value={formData.brand}
                  onChange={(e) =>
                    setFormData({ ...formData, brand: e.target.value })
                  }
                  required
                >
                  <option value="" disabled>
                    Выберите бренд
                  </option>
                  {brands.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Блок 2: Характеристики */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="form-control">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Цена (₽)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary"
                    value={
                      formData.price
                        ? Number(formData.price).toLocaleString("ru-RU")
                        : ""
                    }
                    onChange={handlePriceChange}
                    placeholder="0"
                    required
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                    <CreditCard
                      className="w-4 h-4 text-base-content/40"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>

              <div className="form-control">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Остаток (шт)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary"
                    value={formData.stock}
                    onChange={(e) =>
                      setFormData({ ...formData, stock: e.target.value })
                    }
                    required
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                    <Package
                      className="w-4 h-4 text-base-content/40"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>

              <div className="form-control sm:col-span-2">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Пол
                </label>
                <div className="join w-full">
                  {["Мужской", "Женский", "Унисекс"].map((g) => (
                    <input
                      key={g}
                      className="join-item btn btn-sm flex-1 h-9.5 text-sm focus:outline-none"
                      type="radio"
                      name="gender"
                      aria-label={g}
                      checked={formData.gender === g}
                      onChange={() => setFormData({ ...formData, gender: g })}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Блок 3: Доп. инфо */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Категория
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary"
                    placeholder="Цветочные"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                    <Layers
                      className="w-4 h-4 text-base-content/40"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>

              <div className="form-control">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Концентрация
                </label>
                <select
                  className="select select-bordered w-full focus:outline-none focus:ring-0 focus:border-primary"
                  value={formData.concentration}
                  onChange={(e) =>
                    setFormData({ ...formData, concentration: e.target.value })
                  }
                >
                  <option value="Духи">Духи</option>
                  <option value="Парфюмерная вода">Парфюмерная вода</option>
                  <option value="Туалетная вода">Туалетная вода</option>
                  <option value="Одеколон">Одеколон</option>
                  <option value="Мист">Мист</option>
                  <option value="Масляные духи">Масляные духи</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label font-bold text-sm text-base-content/80 mb-1">
                  Объем (мл)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary"
                    value={formData.volume}
                    onChange={(e) =>
                      setFormData({ ...formData, volume: e.target.value })
                    }
                    required
                    placeholder="0"
                  />
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                    <Beaker
                      className="w-4 h-4 text-base-content/40"
                      strokeWidth={2.5}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Блок 4: Пирамида */}
            <div className="bg-base-200/40 rounded-xl p-5 border border-base-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
                <h4 className="font-bold text-[15px] uppercase tracking-wider opacity-70 flex items-center gap-3 text-base-content">
                  <Pyramid className="w-5 h-5 text-primary" />
                  Пирамида нот
                </h4>

                <div className="form-control w-full sm:w-56">
                  <div className="relative">
                    <input
                      type="text"
                      className="input input-bordered w-full pr-10 focus:outline-none focus:border-secondary text-sm"
                      placeholder="Цветочно-фруктовые"
                      value={formData.scentFamily}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          scentFamily: e.target.value,
                        })
                      }
                      required
                    />
                    <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                      <Palette
                        className="w-4 h-4 text-base-content/40"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 text-xs font-bold text-secondary opacity-70">
                    TOP
                  </div>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full border-b-4 border-b-secondary/20 focus:outline-none focus:border-secondary"
                    placeholder="Верхние ноты"
                    value={formData.notesPyramid.top}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notesPyramid: {
                          ...formData.notesPyramid,
                          top: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-3 pl-4">
                  <div className="w-8 text-xs font-bold text-primary opacity-70">
                    MID
                  </div>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full border-b-4 border-b-primary/20 focus:outline-none focus:border-primary"
                    placeholder="Ноты сердца"
                    value={formData.notesPyramid.middle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notesPyramid: {
                          ...formData.notesPyramid,
                          middle: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                <div className="flex items-center gap-3 pl-8">
                  <div className="w-8 text-xs font-bold text-accent opacity-70">
                    BASE
                  </div>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full border-b-4 border-b-accent/20 focus:outline-none focus:border-accent"
                    placeholder="Базовые ноты"
                    value={formData.notesPyramid.base}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        notesPyramid: {
                          ...formData.notesPyramid,
                          base: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Блок 5: Описание */}
            <div className="form-control w-full">
              <label className="label font-bold text-sm text-base-content/80 mb-1">
                Описание
              </label>
              <textarea
                className="textarea textarea-bordered h-32 w-full resize-none leading-relaxed text-sm focus:outline-none focus:border-primary"
                placeholder="Официальное описание товара, ключевые особенности, философия бренда..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            {/* Блок 6: Хит продаж */}
            <div className="flex items-center justify-between bg-base-100 border border-base-200 p-4 rounded-xl hover:border-base-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <Flame className="w-6 h-6 fill-orange-500" />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-base">«Хит продаж»</span>
                  <span className="text-xs text-base-content/60">
                    Товар будет отмечен как популярный
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-secondary toggle-lg"
                checked={formData.isBestseller}
                onChange={(e) =>
                  setFormData({ ...formData, isBestseller: e.target.checked })
                }
              />
            </div>

            {/* Блок 7: Фото */}
            <div className="form-control">
              <label className="label font-bold text-sm text-base-content/80 mb-1">
                Фотографии
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="relative border-2 border-dashed border-base-300 rounded-2xl hover:border-primary hover:bg-base-50 transition-all aspect-square flex flex-col items-center justify-center cursor-pointer text-center p-2 group">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    required={!productToEdit}
                  />
                  <div className="bg-base-200 p-3 rounded-full mb-1 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <ImageIcon className="w-6 h-6 text-base-content/40 group-hover:text-primary" />
                  </div>
                  <span className="text-xs font-bold text-base-content/60 group-hover:text-primary">
                    Добавить фото
                  </span>
                </div>

                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-base-200 group shadow-sm"
                  >
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setImages(images.filter((_, i) => i !== index));
                          setImagePreviews(
                            imagePreviews.filter((_, i) => i !== index)
                          );
                        }}
                        className="btn btn-circle bg-neutral hover:bg-neutral-focus border-none text-white shadow-xl transform transition-transform"
                      >
                        <Trash2Icon className="w-5 h-5 hover:text-error" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

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
            type="submit"
            form="product-form"
            className="btn btn-primary min-w-30 shadow-lg shadow-primary/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : productToEdit ? (
              "Сохранить"
            ) : (
              "Создать"
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
