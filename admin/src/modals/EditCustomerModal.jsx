import { useState, useEffect, useRef } from "react";
import { XIcon, User, Upload, Trash2, Phone, Mail } from "lucide-react";
import { formatPhoneNumber } from "../lib/utils.js";

export default function EditCustomerModal({
  isOpen,
  onClose,
  customer,
  onSubmit,
  isLoading,
}) {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "user",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  useEffect(() => {
    if (customer && isOpen) {
      setFormData({
        firstName: customer.firstName || "",
        lastName: customer.lastName || "",
        email: customer.email || "",
        phone: customer.phone || "",
        role: customer.role || "user",
      });
      setImagePreview(customer.imageUrl || "");
      setImageFile(null);
    }
  }, [customer, isOpen]);

  // === Маска телефона ===
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  // === Логика фото ===
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

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("firstName", formData.firstName);
    data.append("lastName", formData.lastName);
    data.append("phone", formData.phone);
    data.append("role", formData.role);

    if (imageFile) {
      data.append("image", imageFile);
    }

    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open tracking-wide modal-bottom sm:modal-middle">
      <div className="modal-box p-0 bg-base-100 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Шапка */}
        <div className="bg-base-100 border-b border-base-200 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
          <h3 className="font-bold text-xl flex items-center gap-2 font-raleway">
            Редактирование профиля
          </h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-base-content/60 hover:bg-base-200"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Форма */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[80vh]"
        >
          {/* === Секция 1: Фото профиля === */}
          <div className="flex items-center gap-5 p-4 bg-base-200/40 rounded-xl border border-base-200">
            {/* Аватар */}
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-full border border-base-300 bg-base-100 overflow-hidden flex items-center justify-center">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-base-content/20" />
                )}
              </div>
            </div>

            {/* Кнопки управления */}
            <div className="flex flex-col gap-2 w-full">
              <label className="font-bold text-sm text-base-content/80">
                Фотография
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={triggerFileInput}
                  className="btn btn-sm btn-outline btn-primary gap-2 font-normal"
                >
                  <Upload className="w-4 h-4" />
                  Загрузить
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="btn btn-sm btn-ghost text-error hover:bg-error/10 font-normal"
                  >
                    <Trash2 className="w-4 h-4" />
                    Удалить
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>
          </div>

          {/* === Секция 2: Имя и Фамилия === */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label font-bold text-sm text-base-content/80 mb-1">
                Имя
              </label>
              <label className="input input-bordered flex items-center gap-2 focus-within:border-primary focus-within:outline-none px-3">
                <input
                  type="text"
                  placeholder="Иван"
                  className="grow"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                />
                <User
                  className="w-4.5 h-4.5 text-base-content/40"
                  strokeWidth={2.5}
                />
              </label>
            </div>
            <div className="form-control">
              <label className="label font-bold text-sm text-base-content/80 mb-1">
                Фамилия
              </label>
              <label className="input input-bordered flex items-center gap-2 focus-within:border-primary focus-within:outline-none px-3">
                <input
                  type="text"
                  placeholder="Иванов"
                  className="grow"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                />
                <User
                  className="w-4.5 h-4.5 text-base-content/40"
                  strokeWidth={2.5}
                />
              </label>
            </div>
          </div>

          {/* === Секция 3: Телефон и Роль === */}
          <div className="grid grid-cols-2 gap-4">
            {/* Телефон */}
            <div className="form-control">
              <label className="label font-bold text-sm text-base-content/80 mb-1">
                Телефон
              </label>
              <label className="input input-bordered flex items-center gap-2 focus-within:border-primary focus-within:outline-none px-3">
                <input
                  type="text"
                  placeholder="+7 (999) 999-99-99"
                  className="grow"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={18}
                />
                <Phone
                  className="w-4 h-4 text-base-content/40"
                  strokeWidth={2.5}
                />
              </label>
            </div>

            {/* Роль */}
            <div className="form-control">
              <label className="label font-bold text-sm text-base-content/80 mb-1">
                Роль
              </label>
              <div className="join w-full">
                {[
                  { label: "Клиент", value: "user" },
                  { label: "Админ", value: "admin" },
                ].map((r) => (
                  <input
                    key={r.value}
                    className="join-item btn btn-md flex-1 text-sm font-medium focus:outline-none border-base-300"
                    type="radio"
                    name="role"
                    aria-label={r.label}
                    checked={formData.role === r.value}
                    onChange={() => setFormData({ ...formData, role: r.value })}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* === Секция 4: Email === */}
          <div className="form-control w-full">
            <label className="label font-bold text-sm text-base-content/80 mb-1">
              Email
            </label>
            <label className="input input-bordered flex items-center gap-2 bg-base-200/50 text-base-content/50 cursor-not-allowed border-base-200 px-3 w-full">
              <input
                type="text"
                value={formData.email}
                disabled
                className="grow min-w-0 cursor-not-allowed w-full"
              />
              <Mail
                className="w-4 h-4 shrink-0 text-base-content/30"
                strokeWidth={2.5}
              />
            </label>
          </div>
        </form>

        {/* Футер */}
        <div className="modal-action p-6 border-t border-base-200 bg-base-50/50 mt-0">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost hover:bg-base-200 font-normal"
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
            ) : (
              "Сохранить"
            )}
          </button>
        </div>
      </div>

      {/* Подложка */}
      <div
        className="modal-backdrop bg-black/40"
        onClick={!isLoading ? onClose : undefined}
      ></div>
    </div>
  );
}
