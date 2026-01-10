import { useState, useEffect } from "react";
import {
  XIcon,
  ImageIcon,
  Trash2Icon,
  Pyramid,
  Palette,
  Zap,
  Tag,
  CreditCard,
  Package,
  Layers,
  Beaker,
  PlusIcon,
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
  ingredients: "",
  isBestseller: false,
  variants: [],
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
  const [activeVolume, setActiveVolume] = useState(0);
  const [isWaitingForVolume, setIsWaitingForVolume] = useState(false);
  const [pendingVolume, setPendingVolume] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (productToEdit) {
        // Логика инициализации вариантов
        let initialVariants = productToEdit.variants || [];
        // Если вариантов нет, но есть старые поля - создадим "виртуальный" вариант
        if (initialVariants.length === 0 && productToEdit.volume) {
          initialVariants = [
            {
              volume: productToEdit.volume,
              price: productToEdit.price,
              stock: productToEdit.stock,
            },
          ];
        }

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
          ingredients: productToEdit.ingredients || "",
          isBestseller: productToEdit.isBestseller || false,
          variants: initialVariants,
        });

        // Устанавливаем активный объем (первый из вариантов или 0)
        if (initialVariants.length > 0) {
          setActiveVolume(initialVariants[0].volume);
        } else {
          setActiveVolume(productToEdit.volume || 0);
        }

        setImagePreviews(productToEdit.images || []);
        setImages([]);
      } else {
        setFormData({ ...initialFormState, variants: [] });
        setActiveVolume(0);
        setImages([]);
        setImagePreviews([]);
        setIsWaitingForVolume(false);
        setPendingVolume("");
      }
    } else {
      // Reset state on close
      setIsWaitingForVolume(false);
      setPendingVolume("");
    }
  }, [isOpen, productToEdit]);

  const handleVariantSwitch = (volume) => {
    setActiveVolume(volume);
  };

  const updateActiveVariantField = (field, value) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      const variantIndex = newVariants.findIndex(v => v.volume === activeVolume);

      if (variantIndex > -1) {
        if (field === "volume") {
          const newVol = parseInt(value) || 0;
          if (newVariants.some((v, idx) => idx !== variantIndex && v.volume === newVol)) {
            alert("Такой объем уже есть");
            return prev;
          }
          newVariants[variantIndex] = { ...newVariants[variantIndex], volume: newVol };
          setActiveVolume(newVol);
        } else {
          newVariants[variantIndex] = { ...newVariants[variantIndex], [field]: value };
        }
        return { ...prev, variants: newVariants };
      }
      return prev;
    });
  };

  const handleAddVariant = () => {
    if (formData.variants.length === 0) {
      const volNum = parseInt(formData.volume);
      if (!volNum) {
        alert("Сначала укажите объем для первого варианта");
        return;
      }

      const firstVariant = {
        volume: volNum,
        price: formData.price || 0,
        stock: formData.stock || 0
      };

      setFormData(prev => ({
        ...prev,
        variants: [firstVariant]
      }));
      setActiveVolume(volNum);
      setActiveVolume(volNum);
    } else {
      setIsWaitingForVolume(true);
      setActiveVolume(0);
      setPendingVolume("");
      setFormData(prev => ({ ...prev, price: "", stock: "" }));
    }
  };

  const confirmNewVariant = (volume) => {
    const volNum = parseInt(volume);
    if (!volNum) return;

    if (formData.variants.some(v => v.volume === volNum)) {
      alert("Такой объем уже есть");
      return;
    }

    const newVariant = {
      volume: volNum,
      price: formData.price || 0,
      stock: formData.stock || 0
    };

    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant]
    }));
    setActiveVolume(volNum);
    setIsWaitingForVolume(false);
  };

  const handleRemoveVariant = (vol) => {
    if (!confirm("Удалить этот вариант?")) return;
    setFormData(prev => {
      const newVariants = prev.variants.filter(v => v.volume !== vol);
      return { ...prev, variants: newVariants };
    });
    if (activeVolume === vol) {
      setActiveVolume(0);
    }
  };

  const getCurrentVariantValues = () => {
    if (!activeVolume) return { price: formData.price, stock: formData.stock };
    const variant = formData.variants.find(v => v.volume === activeVolume);
    return variant ? { price: variant.price, stock: variant.stock } : { price: 0, stock: 0 };
  };

  const currentValues = getCurrentVariantValues();

  const handlePriceChange = (e) => {
    const rawValue = e.target.value.replace(/\s/g, "");
    if (rawValue && isNaN(rawValue)) return;

    if (activeVolume > 0) {
      updateActiveVariantField("price", rawValue);
    } else {
      setFormData({ ...formData, price: rawValue });
    }
  };

  const handleStockChange = (e) => {
    const val = e.target.value;
    if (activeVolume > 0) {
      updateActiveVariantField("stock", val);
    } else {
      setFormData({ ...formData, stock: val });
    }
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
      } else if (key === "variants") {
        formDataToSend.append("variants", JSON.stringify(formData.variants));
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
              ? `Редактирование: ${productToEdit.name} `
              : "Новый товар"}
            {productToEdit?.article && (
              <span className="ml-2 px-2 py-1 text-xs font-mono font-medium text-base-content/60 bg-base-200 rounded-md border border-base-300">
                {productToEdit.article}
              </span>
            )}
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
                <label className="label font-semibold text-sm text-base-content/80 mb-1">
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
                <label className="label font-semibold text-sm text-base-content/80 mb-1">
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

            {/* Блок 2: Варианты и Цены */}
            <div className="divider my-2"></div>
            <div className="bg-base-200/50 rounded-xl p-4 border border-base-200">
              <div className="flex justify-between items-center mb-1">
                <label className="label font-semibold text-sm text-base-content/80 mb-1">
                  Объем и варианты
                </label>

              </div>

              {formData.variants.length > 0 ? (
                <div className="flex flex-wrap gap-2 bg-base-100 p-2 rounded-2xl">
                  {formData.variants.map((v) => {
                    const isActive = activeVolume === v.volume;

                    return (
                      <div
                        key={v.volume}
                        role="button"
                        className={`
            flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all duration-200 text-xs font-medium select-none
            ${isActive
                            ? "bg-primary text-white border-primary shadow-md z-10"
                            : "bg-base-200 text-base-content/70 border-transparent hover:bg-base-300 hover:text-base-content"
                          }
          `}
                        onClick={() => {
                          setActiveVolume(v.volume);
                          setIsWaitingForVolume(false);
                        }}
                      >
                        <span>{v.volume} мл</span>

                        <button
                          type="button"
                          className={`
              w-5 h-5 flex items-center -mr-1.5 justify-center rounded-full transition-all
              ${isActive
                              ? "bg-white/20 text-white hover:text-error"
                              : "bg-black/5 text-base-content/50 hover:text-error hover:shadow-sm"
                            }
            `}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveVariant(v.volume);
                          }}
                        >
                          <XIcon className="w-2.5 h-2.5" strokeWidth={3.5} />
                        </button>
                      </div>
                    );
                  })}


                  {isWaitingForVolume && (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-dashed border-primary/50 bg-primary/10 text-primary animate-pulse text-xs font-medium select-none">
                      <span className="loading loading-spinner loading-xs scale-90"></span>
                      <span className="opacity-75">Ввод...</span>
                      <button
                        type="button"
                        className="w-5 h-5 flex items-center justify-center -mr-1.5 bg-base-100/50 text-base-content/60 hover:text-error rounded-full transition-all shadow-sm "
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsWaitingForVolume(false);
                          setPendingVolume("");
                          if (formData.variants.length > 0) {
                            setActiveVolume(formData.variants[0].volume);
                          }
                        }}
                      >
                        <XIcon className="w-2.5 h-2.5" strokeWidth={3.5} />
                      </button>
                    </div>
                  )}

                  {/* Кнопка добавления в конце */}
                  {!isWaitingForVolume && (
                    <button
                      type="button"
                      onClick={handleAddVariant}
                      className="ml-auto btn btn-sm mt-px btn-primary btn-outline gap-1.5 rounded-lg shadow-sm bg-base-100 hover:bg-primary hover:text-white transition-all"
                    >
                      <PlusIcon className="w-3.5 h-3.5" strokeWidth={3} />
                      Добавить
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-xs text-base-content/50 mb-2">
                  {isWaitingForVolume ? (
                    <span className="flex items-center gap-2 text-primary font-medium animate-pulse">
                      <span className="loading loading-spinner loading-xs"></span>
                      Ожидание ввода объема...
                    </span>
                  ) : (
                    <span className="text-xs text-base-content/50">
                      Нет вариантов
                    </span>
                  )}
                </div>
              )}

              <div className="grid mt-2 grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label font-semibold text-sm text-base-content/80 mb-1">
                    Объем (мл)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary"
                      value={isWaitingForVolume ? pendingVolume : (activeVolume > 0 ? activeVolume : formData.volume)}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (isWaitingForVolume) {
                          setPendingVolume(val);
                        } else if (activeVolume > 0) {
                          updateActiveVariantField("volume", val);
                        } else {
                          setFormData({ ...formData, volume: val });
                        }
                      }}
                      onBlur={(e) => {
                        if (isWaitingForVolume && e.target.value) {
                          confirmNewVariant(e.target.value);
                        }
                      }}
                      onKeyDown={(e) => {
                        if (isWaitingForVolume && e.key === 'Enter') {
                          e.preventDefault();
                          if (e.target.value) confirmNewVariant(e.target.value);
                        }
                      }}
                      autoFocus={isWaitingForVolume}
                      required
                      placeholder={isWaitingForVolume ? "Введите объем..." : "0"}
                    />
                    <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none">
                      <Beaker
                        className="w-4 h-4 text-base-content/40"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label font-semibold text-sm text-base-content/80 mb-1">
                    Цена (₽)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary"
                      value={
                        currentValues.price
                          ? Number(currentValues.price).toLocaleString("ru-RU")
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
                  <label className="label font-semibold text-sm text-base-content/80 mb-1">
                    Остаток (шт)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      className="input input-bordered w-full pr-10 focus:outline-none focus:border-primary"
                      value={currentValues.stock}
                      onChange={handleStockChange}
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
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="form-control">
                <label className="label font-semibold text-sm text-base-content/80 mb-1">
                  Группа ароматов
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered pb-0.5 w-full pr-10 focus:outline-none focus:border-primary"
                    placeholder="Цветочно-фруктовые"
                    value={formData.scentFamily}
                    onChange={(e) =>
                      setFormData({ ...formData, scentFamily: e.target.value })
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

              <div className="form-control">
                <label className="label font-semibold text-sm text-base-content/80 mb-1">
                  Категория
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="input input-bordered pb-0.5 w-full pr-10 focus:outline-none focus:border-primary"
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
                <label className="label font-semibold text-sm text-base-content/80 mb-1">
                  Концентрация
                </label>
                <select
                  className="select select-bordered pb-0.5 w-full focus:outline-none focus:ring-0 focus:border-primary"
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
            </div>

            {/* Блок 4: Пирамида */}
            <div className="divider my-2"></div>
            <div className="bg-base-200/40 rounded-xl p-5 border border-base-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h4 className="font-bold text-[15px] uppercase tracking-wider opacity-70 flex items-center gap-3 text-base-content">
                  <Pyramid className="w-6 h-6 text-primary" />
                  Пирамида нот
                </h4>

                <div className="form-control w-full sm:w-56">
                  <label className="label font-bold text-sm text-base-content/80 mb-1 sm:hidden">
                    Пол
                  </label>
                  <select
                    className="select select-bordered pb-0.5 w-full focus:outline-none focus:ring-0 focus:border-secondary font-normal"
                    value={formData.gender}
                    onChange={(e) =>
                      setFormData({ ...formData, gender: e.target.value })
                    }
                  >
                    <option value="Унисекс">Унисекс</option>
                    <option value="Мужской">Мужской</option>
                    <option value="Женский">Женский</option>
                  </select>
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

            {/* Блок 5: Описание и Состав */}
            <div className="divider my-2"></div>
            <div className="flex flex-col gap-3">
              <div className="form-control w-full">
                <label className="label font-semibold text-sm text-base-content/80 mb-1">
                  Описание
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 w-full resize-none leading-relaxed text-sm focus:outline-none focus:border-primary"
                  placeholder="Официальное описание товара..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control w-full">
                <label className="label font-semibold text-sm text-base-content/80 mb-1">
                  Состав
                </label>
                <textarea
                  className="textarea textarea-bordered h-24 w-full resize-none leading-relaxed text-sm focus:outline-none focus:border-primary"
                  placeholder="Список ингредиентов (Аlcohol denat, Parfum, Water...)"
                  value={formData.ingredients}
                  onChange={(e) =>
                    setFormData({ ...formData, ingredients: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Блок 6: Хит продаж */}
            <div className="divider my-2"></div>
            <div className="flex items-center justify-between bg-base-100 border border-base-200 p-4 rounded-xl hover:border-base-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <Zap className="w-6 h-6 fill-orange-500" />
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
            <div className="divider my-2"></div>
            <div className="form-control">
              <label className="label font-semibold text-sm text-base-content/80 mb-1">
                Фотографии
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="col-span-2 sm:col-span-4">
                  <div className="relative border-2 border-dashed border-base-300 rounded-2xl hover:border-primary hover:bg-base-50 transition-all flex flex-col items-center justify-center cursor-pointer text-center p-6 group w-full">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      required={!productToEdit && images.length === 0}
                    />
                    <div className="bg-base-200 p-3 rounded-full mb-3 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <ImageIcon className="w-8 h-8 text-base-content/40 group-hover:text-primary" />
                    </div>
                    <span className="text-sm font-semibold text-base-content/80 group-hover:text-primary mb-1">
                      Нажмите для загрузки фото
                    </span>
                    <span className="text-[13px] text-base-content/50">
                      Поддерживаемые форматы: JPEG, JPG, PNG, WEBP. Макс. размер: 5 MB
                    </span>
                  </div>
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
