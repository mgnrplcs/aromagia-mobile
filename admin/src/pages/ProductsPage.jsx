import { useState } from "react";
import { Link } from "react-router";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  ImageIcon,
  SearchIcon,
  Filter,
  Package,
  Zap,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { productApi, brandApi } from "../lib/api";

import PageLoader from "../components/PageLoader";
import ProductFormModal from "../modals/ProductFormModal";
import DeleteProductModal from "../modals/DeleteProductModal";

function ProductsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();

  // Состояние поиска
  const [searchTerm, setSearchTerm] = useState("");

  // Состояние модалки формы (Create/Edit)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Состояние модалки удаления
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

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

  // --- Мутации ---

  const createProductMutation = useMutation({
    mutationFn: async (formData) => {
      const token = await getToken();
      return productApi.create(formData, token);
    },
    onSuccess: () => {
      handleCloseFormModal();
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
      handleCloseFormModal();
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
      handleCloseDeleteModal();
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (err) => alert(err.message),
  });

  // --- Хендлеры UI ---

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = (formData) => {
    if (editingProduct) {
      updateProductMutation.mutate({
        id: editingProduct._id,
        formData: formData,
      });
    } else {
      createProductMutation.mutate(formData);
    }
  };

  const handleOpenDeleteModal = (product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete._id);
    }
  };

  const isLoadingAction =
    createProductMutation.isPending || updateProductMutation.isPending;
  const isDeleting = deleteProductMutation.isPending;

  // Фильтрация
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.brand?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (productsLoading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6 tracking-wide">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <Package className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-raleway">Товары</h1>
            <p className="text-base-content/70 text-sm">
              Всего товаров: {products.length}
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* Поиск */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Поиск..."
              className="input input-bordered w-full pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchIcon className="w-4 h-4 absolute left-3.5 top-3 text-base-content/50" />
          </div>

          {/* Кнопка фильтра */}
          <button className="btn btn-square btn-ghost border border-base-200">
            <Filter className="w-5 h-5 text-base-content" />
          </button>

          {/* Кнопка добавления */}
          <button
            onClick={handleOpenCreateModal}
            className="btn btn-outline btn-primary gap-1.5"
          >
            <PlusIcon className="w-4.5 h-4.5" />
            <span className="hidden sm:inline mb-0.5">Добавить</span>
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
            return (
              <div
                key={product._id}
                className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-shadow"
              >
                <div className="card-body p-5">
                  <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
                    {/* Аватар */}
                    <div className="avatar shrink-0">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl ring-1 ring-base-200 bg-base-50 flex items-center justify-center overflow-hidden">
                        {/* Бейджик ХИТ  */}
                        {product.isBestseller && (
                          <div className="absolute top-1.25 left-1.5 z-10 badge badge-secondary text-white tracking-widest text-[9px] h-5 px-2 font-bold gap-1 shadow-sm border-none">
                            <Zap className="w-2.5 h-2.5 fill-current" />
                            ХИТ
                          </div>
                        )}
                        {product.images?.[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <ImageIcon className="text-base-content/20 w-8 h-8" />
                        )}
                      </div>
                    </div>

                    {/* Информация */}
                    <div className="flex-1 min-w-0 w-full">
                      <div className="mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-lg truncate leading-tight">
                            {product.name}
                          </h3>
                        </div>

                        {/* Бренд */}
                        <div>
                          {product.brand ? (
                            <Link
                              to="/brands"
                              onClick={(e) => e.stopPropagation()}
                              className="btn btn-xs btn-link text-primary px-0 no-underline hover:underline min-h-0 h-auto text-sm font-medium"
                            >
                              {product.brand.name}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-base-content/50">
                              Без бренда
                            </span>
                          )}
                        </div>

                        {/* Концентрация • Пол */}
                        <p className="text-xs text-base-content/60 mt-1">
                          {product.concentration} • {product.gender}
                        </p>
                      </div>

                      {/* Нижний блок: Характеристики */}
                      <div className="flex gap-8 border-t border-base-100 pt-2">
                        <div>
                          <p className="text-[11px] opacity-60 font-bold uppercase tracking-wider">
                            Цена
                          </p>
                          {/* Шрифт extrabold для большей жирности */}
                          <p className="font-extrabold text-lg">
                            {product.price?.toLocaleString("ru-RU")} ₽
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] opacity-60 font-bold uppercase tracking-wider">
                            Склад
                          </p>
                          <p className="font-extrabold text-lg">
                            {product.stock} шт.
                          </p>
                        </div>
                        <div>
                          <p className="text-[11px] opacity-60 font-bold uppercase tracking-wider">
                            Объем
                          </p>
                          <p className="font-extrabold text-lg">
                            {product.volume} мл
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Действия (Кнопки) */}
                    <div className="flex flex-row items-center gap-2 mt-2 sm:mt-0 sm:self-center">
                      <button
                        className="btn btn-square btn-ghost border border-base-200 hover:border-primary hover:text-primary"
                        onClick={() => handleOpenEditModal(product)}
                        title="Редактировать"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        className="btn btn-square btn-ghost border border-base-200 hover:border-error hover:text-error hover:bg-error/10"
                        onClick={() => handleOpenDeleteModal(product)}
                        title="Удалить"
                      >
                        <Trash2Icon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Модалки */}
      <ProductFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseFormModal}
        productToEdit={editingProduct}
        brands={brands}
        onSubmit={handleFormSubmit}
        isLoading={isLoadingAction}
      />

      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
        productBrand={productToDelete?.brand?.name || "Без бренда"}
        productImage={productToDelete?.images?.[0] || null}
        isLoading={isDeleting}
      />
    </div>
  );
}

export default ProductsPage;
