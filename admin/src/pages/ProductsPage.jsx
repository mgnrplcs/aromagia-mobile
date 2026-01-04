import { useState } from "react";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  XIcon,
  ImageIcon,
  SearchIcon,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { productApi, brandApi } from "../lib/api";
import { getStockStatusBadge } from "../lib/utils";

function ProductsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const [formData, setFormData] = useState(initialFormState);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // 1. Загрузка товаров
  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const token = await getToken();
      return productApi.getAll(token);
    },
  });

  // 2. Загрузка брендов
  const { data: brands = [] } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const token = await getToken();
      return brandApi.getAll(token);
    },
  });

  // Мутации
  const createProductMutation = useMutation({
    mutationFn: async (data) => {
      const token = await getToken();
      return productApi.create(data, token);
    },
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => alert(err.message),
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const token = await getToken();
      return productApi.update({ id, formData }, token);
    },
    onSuccess: () => {
      closeModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => alert(err.message),
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      return productApi.delete(id, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  // Хендлеры
  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setImages([]);
    setImagePreviews([]);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand?._id || product.brand || "",
      description: product.description,
      price: product.price,
      volume: product.volume,
      stock: product.stock,
      category: product.category,
      gender: product.gender,
      scentFamily: product.scentFamily,
      concentration: product.concentration,
      notesPyramid: {
        top: product.notesPyramid?.top || "",
        middle: product.notesPyramid?.middle || "",
        base: product.notesPyramid?.base || "",
      },
      isBestseller: product.isBestseller || false,
    });
    setImagePreviews(product.images || []);
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 8) return alert("Максимум 8 изображений");
    imagePreviews.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    setImages(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct && images.length === 0) return alert("Загрузите фото");

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

    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct._id,
        formData: formDataToSend,
      });
    } else {
      createProductMutation.mutate(formDataToSend);
    }
  };

  const isLoadingAction =
    createProductMutation.isPending || updateProductMutation.isPending;

  // Фильтрация для поиска
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (productsLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold font-raleway">Товары</h1>
          <p className="text-base-content/70 mt-1 text-sm">
            Всего товаров: {products.length}
          </p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Поиск..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="w-4 h-4 absolute left-3 top-3.5 text-base-content/50" />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Добавить</span>
          </button>
        </div>
      </div>

      {/* Список товаров */}
      <div className="grid grid-cols-1 gap-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-base-content/50 bg-base-100 rounded-xl border border-dashed border-base-300">
            Ничего не найдено
          </div>
        ) : (
          filteredProducts.map((product) => {
            const status = getStockStatusBadge(product.stock);
            return (
              <div
                key={product._id}
                className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow"
              >
                <div className="card-body p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Аватар */}
                    <div className="avatar">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl ring-1 ring-base-200 bg-base-50">
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="object-cover"
                          />
                        ) : (
                          <ImageIcon className="text-base-content/20 m-auto mt-8 w-8 h-8" />
                        )}
                      </div>
                    </div>

                    {/* Информация */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-bold text-lg truncate">
                              {product.name}
                            </h3>
                            {product.isBestseller && (
                              <div className="badge badge-secondary badge-xs font-bold">
                                HIT
                              </div>
                            )}
                          </div>
                          <p className="text-sm font-medium text-primary mt-0.5">
                            {product.brand?.name || "Без бренда"}
                          </p>
                          <p className="text-xs text-base-content/60 mt-1">
                            {product.category} • {product.gender}
                          </p>
                        </div>
                        <div className={`badge ${status.class} shrink-0`}>
                          {status.text}
                        </div>
                      </div>

                      <div className="flex gap-6 mt-4 border-t border-base-100 pt-3">
                        <div>
                          <p className="text-[10px] opacity-60 uppercase tracking-wider">
                            Цена
                          </p>
                          <p className="font-bold text-lg">
                            {product.price?.toLocaleString()} ₽
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-60 uppercase tracking-wider">
                            На складе
                          </p>
                          <p className="font-medium">{product.stock} шт.</p>
                        </div>
                        <div>
                          <p className="text-[10px] opacity-60 uppercase tracking-wider">
                            Объем
                          </p>
                          <p className="font-medium">{product.volume} мл</p>
                        </div>
                      </div>
                    </div>

                    {/* Действия */}
                    <div className="flex flex-row sm:flex-col gap-1 justify-end border-t sm:border-t-0 border-base-100 pt-3 sm:pt-0">
                      <button
                        className="btn btn-square btn-ghost btn-sm"
                        onClick={() => handleEdit(product)}
                      >
                        <PencilIcon className="w-4 h-4 text-base-content/70" />
                      </button>
                      <button
                        className="btn btn-square btn-ghost btn-sm hover:bg-error/10 hover:text-error"
                        onClick={() => {
                          if (confirm("Удалить этот товар?"))
                            deleteProductMutation.mutate(product._id);
                        }}
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Модальное окно */}
      <input
        type="checkbox"
        className="modal-toggle"
        checked={showModal}
        readOnly
      />
      <div className="modal modal-bottom sm:modal-middle" role="dialog">
        <div className="modal-box w-11/12 max-w-3xl max-h-[85vh] overflow-y-auto p-0 scrollbar-thin">
          {/* Шапка модалки */}
          <div className="sticky top-0 bg-base-100/95 backdrop-blur z-20 border-b border-base-200 px-6 py-4 flex justify-between items-center">
            <h3 className="font-bold text-xl">
              {editingProduct
                ? `Редактирование: ${editingProduct.name}`
                : "Новый товар"}
            </h3>
            <button
              onClick={closeModal}
              className="btn btn-sm btn-circle btn-ghost"
            >
              <XIcon className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Блок 1: Основное */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label font-medium text-sm">
                  Название товара
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Например: Sauvage"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>

              {/* ЗАМЕНА INPUT НА SELECT */}
              <div className="form-control w-full">
                <label className="label font-medium text-sm">Бренд</label>
                <select
                  className="select select-bordered w-full"
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
                {brands.length === 0 && (
                  <span className="label-text-alt text-error mt-1">
                    Список брендов пуст. Сначала создайте бренды.
                  </span>
                )}
              </div>
            </div>

            {/* Блок 2: Характеристики (Поменял местами Пол и Категорию) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="form-control">
                <label className="label font-medium text-sm">Цена (₽)</label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered w-full"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control">
                <label className="label font-medium text-sm">
                  Остаток (шт)
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered w-full"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-control sm:col-span-2">
                <label className="label font-medium text-sm">Пол</label>
                <div className="join w-full">
                  {["Мужской", "Женский", "Унисекс"].map((g) => (
                    <input
                      key={g}
                      className="join-item btn btn-sm flex-1 mt-0.5"
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Категория переехала сюда */}
              <div className="form-control">
                <label className="label font-medium text-sm">Категория</label>
                <input
                  type="text"
                  list="categories-list"
                  className="input input-bordered w-full"
                  placeholder="Цветочные"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                />
                <datalist id="categories-list">
                  <option value="Цветочные" />
                  <option value="Древесные" />
                  <option value="Восточные" />
                  <option value="Фруктовые" />
                  <option value="Фужерные" />
                </datalist>
              </div>

              <div className="form-control">
                <label className="label font-medium text-sm">
                  Концентрация
                </label>
                <select
                  className="select select-bordered w-full"
                  value={formData.concentration}
                  onChange={(e) =>
                    setFormData({ ...formData, concentration: e.target.value })
                  }
                >
                  <option value="Духи">Духи</option>
                  <option value="Парфюмерная вода">Парфюмерная вода</option>
                  <option value="Туалетная вода">Туалетная вода</option>
                  <option value="Одеколон">Одеколон</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label font-medium text-sm">Объем (мл)</label>
                <input
                  type="number"
                  className="input input-bordered w-full"
                  value={formData.volume}
                  onChange={(e) =>
                    setFormData({ ...formData, volume: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Блок 3: Пирамида Ароматов (НОВЫЙ ДИЗАЙН) */}
            <div className="bg-base-200/50 rounded-xl p-5 border border-base-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-sm uppercase tracking-wider opacity-70">
                  Пирамида нот
                </h4>
                <div className="form-control w-1/4">
                  <input
                    type="text"
                    className="input input-sm input-ghost text-right"
                    placeholder="Семейство (напр. Пряные)"
                    value={formData.scentFamily}
                    onChange={(e) =>
                      setFormData({ ...formData, scentFamily: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* Верхние */}
                <div className="flex items-center gap-3">
                  <div className="w-8 text-xs font-bold text-secondary opacity-70">
                    TOP
                  </div>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full border-b-4 border-b-secondary/20 focus:border-b-secondary"
                    placeholder="Верхние ноты (через запятую)"
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
                {/* Средние */}
                <div className="flex items-center gap-3 pl-4">
                  <div className="w-8 text-xs font-bold text-primary opacity-70">
                    MID
                  </div>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full border-b-4 border-b-primary/20 focus:border-b-primary"
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
                {/* База */}
                <div className="flex items-center gap-3 pl-8">
                  <div className="w-8 text-xs font-bold text-accent opacity-70">
                    BASE
                  </div>
                  <input
                    type="text"
                    className="input input-bordered input-sm w-full border-b-4 border-b-accent/20 focus:border-b-accent"
                    placeholder="Базовые ноты / Шлейф"
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

            {/* Блок 4: Описание и Опции */}
            <div className="form-control w-full">
              <label className="label font-medium text-sm">Описание</label>
              <textarea
                className="textarea textarea-bordered h-32 w-full resize-none leading-relaxed"
                placeholder="Расскажите об аромате..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="flex items-center justify-between bg-base-100 border border-base-200 p-4 rounded-lg">
              <span className="label-text font-medium flex flex-col">
                <span>Хит продаж</span>
                <span className="text-xs opacity-50 font-normal">
                  Товар получит бейдж "HIT"
                </span>
              </span>
              <input
                type="checkbox"
                className="toggle toggle-secondary"
                checked={formData.isBestseller}
                onChange={(e) =>
                  setFormData({ ...formData, isBestseller: e.target.checked })
                }
              />
            </div>

            {/* Блок 5: Фото */}
            <div className="form-control">
              <label className="label font-medium text-sm">Фотографии</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Кнопка загрузки */}
                <div className="relative border-2 border-dashed border-base-300 rounded-xl hover:border-primary hover:bg-base-50 transition-colors aspect-square flex flex-col items-center justify-center cursor-pointer text-center p-2">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required={!editingProduct}
                  />
                  <ImageIcon className="w-6 h-6 text-base-content/40 mb-1" />
                  <span className="text-xs font-medium">Добавить</span>
                </div>

                {/* Превьюшки */}
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative aspect-square rounded-xl overflow-hidden border border-base-200 group"
                  >
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => {
                          setImages(images.filter((_, i) => i !== index));
                          setImagePreviews(
                            imagePreviews.filter((_, i) => i !== index)
                          );
                        }}
                        className="btn btn-xs btn-circle btn-error"
                      >
                        <Trash2Icon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </form>

          {/* Футер модалки  */}
          <div className="sticky bottom-0 bg-base-100 border-t border-base-200 p-4 flex justify-end gap-3 z-20">
            <button
              type="button"
              onClick={closeModal}
              className="btn"
              disabled={isLoadingAction}
            >
              Отмена
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn btn-primary min-w-30"
              disabled={isLoadingAction}
            >
              {isLoadingAction ? (
                <span className="loading loading-spinner loading-sm" />
              ) : editingProduct ? (
                "Сохранить"
              ) : (
                "Создать"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductsPage;
