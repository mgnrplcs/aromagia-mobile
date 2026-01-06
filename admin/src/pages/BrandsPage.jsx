import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tags,
  Search,
  Plus,
  PencilIcon,
  Trash2Icon,
  ImageIcon,
} from "lucide-react";
import { brandApi } from "../lib/api";
import PageLoader from "../components/PageLoader";
import BrandModal from "../modals/BrandModal";
import DeleteBrandModal from "../modals/DeleteBrandModal";

function BrandsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [deletingBrand, setDeletingBrand] = useState(null);

  // 1. Загрузка
  const { data: brandsData, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: async () => {
      const token = await getToken();
      return brandApi.getAll(token);
    },
  });

  // 2. Мутации
  const createMutation = useMutation({
    mutationFn: async (formData) => {
      const token = await getToken();
      return brandApi.create(formData, token);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const token = await getToken();
      return brandApi.update({ id, formData }, token);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setEditingBrand(null);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const token = await getToken();
      return brandApi.delete(id, token);
    },
    onSuccess: () => {
      setDeletingBrand(null);
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });

  const handleCreate = () => {
    setEditingBrand(null);
    setIsModalOpen(true);
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (brand) => {
    setDeletingBrand(brand);
  };

  const handleSubmit = (formData) => {
    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  // Получение данных
  const brands =
    brandsData?.brands || (Array.isArray(brandsData) ? brandsData : []) || [];

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-base-100 p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 bg-primary/10 rounded-xl text-primary shrink-0">
            <Tags className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-raleway">Бренды</h1>
            <p className="text-base-content/70 text-sm">
              Всего брендов: {brands.length}
            </p>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Поиск бренда..."
              className="input input-bordered w-full pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-base-content/50" />
          </div>
          <button
            onClick={handleCreate}
            className="btn btn-outline btn-primary gap-1.5"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline mb-0.5">Добавить</span>
          </button>
        </div>
      </div>

      {/* Сетка брендов */}
      {filteredBrands.length === 0 ? (
        <div className="card bg-base-100 shadow-sm border border-base-200 py-20 text-center">
          <div className="flex justify-center mb-4">
            <Tags className="w-16 h-16 opacity-20" />
          </div>
          <p className="text-xl font-semibold mb-1">Бренды не найдены</p>
          <p className="text-sm opacity-60">
            Добавьте новый бренд, чтобы начать
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBrands.map((brand) => (
            <div
              key={brand._id}
              className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md hover:border-primary/30 transition-all group relative flex flex-col"
            >
              <div className="card-body p-4 flex flex-col items-center text-center">
                {/* Контейнер с логотипом и кнопками */}
                <div className="w-full aspect-3/2 bg-white rounded-xl flex items-center justify-center mb-3 p-2 relative overflow-hidden border border-base-100">
                  {brand.logo ? (
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-10 h-10 text-base-content/20" />
                  )}

                  {/* Кнопки  */}
                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="btn btn-sm btn-square 
            bg-base-300 border border-base-400 
            text-base-content/70 
            hover:border-primary hover:text-primary 
            hover:bg-base-300 
            shadow-sm hover:shadow-md 
            transition-all duration-200"
                      onClick={() => handleEdit(brand)}
                      title="Редактировать"
                    >
                      <PencilIcon className="w-4 h-4" strokeWidth={2.5} />
                    </button>

                    <button
                      className="btn btn-sm btn-square 
            bg-base-300 border border-base-400 
            text-base-content/70 
            hover:border-error hover:text-error 
            hover:bg-base-300 
            shadow-sm hover:shadow-md 
            transition-all duration-200"
                      onClick={() => handleDeleteClick(brand)}
                      title="Удалить"
                    >
                      <Trash2Icon className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>

                <h3
                  className="font-semibold text-lg truncate w-full mb-1 group-hover:text-primary transition-colors duration-200"
                  title={brand.name}
                >
                  {brand.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалки */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        brandToEdit={editingBrand}
        onSubmit={handleSubmit}
        isLoading={isSaving}
      />

      <DeleteBrandModal
        isOpen={!!deletingBrand}
        onClose={() => setDeletingBrand(null)}
        onConfirm={() => deleteMutation.mutate(deletingBrand._id)}
        brand={deletingBrand}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

export default BrandsPage;
