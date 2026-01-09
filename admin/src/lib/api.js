import axiosInstance from "./axios";

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// === Товары (Products) ===
export const productApi = {
  // Получить все товары
  getAll: async (token) => {
    const { data } = await axiosInstance.get(
      "/admin/products",
      getHeaders(token)
    );
    return data;
  },
  // Создать товар
  create: async (formData, token) => {
    const { data } = await axiosInstance.post(
      "/admin/products",
      formData,
      getHeaders(token)
    );
    return data;
  },
  // Обновить товар
  update: async ({ id, formData }, token) => {
    const { data } = await axiosInstance.put(
      `/admin/products/${id}`,
      formData,
      getHeaders(token)
    );
    return data;
  },
  // Удалить товар
  delete: async (id, token) => {
    const { data } = await axiosInstance.delete(
      `/admin/products/${id}`,
      getHeaders(token)
    );
    return data;
  },
};

// === Заказы (Orders) ===
export const orderApi = {
  // Получить все заказы
  getAll: async (token) => {
    const { data } = await axiosInstance.get(
      "/admin/orders",
      getHeaders(token)
    );
    return data;
  },
  // Обновить статус заказа
  updateStatus: async ({ orderId, status }, token) => {
    const { data } = await axiosInstance.patch(
      `/admin/orders/${orderId}/status`,
      { status },
      getHeaders(token)
    );
    return data;
  },
};

// === Аналитика (Stats) ===
export const statsApi = {
  // Получить данные для дашборда
  getDashboard: async (token) => {
    const { data } = await axiosInstance.get("/admin/stats", getHeaders(token));
    return data;
  },
};

// === Клиенты (Customers) ===
export const customerApi = {
  // Получить список всех клиентов
  getAll: async (token) => {
    const { data } = await axiosInstance.get(
      "/admin/customers",
      getHeaders(token)
    );
    return data;
  },
  // Обновить данные клиента
  update: async ({ id, formData }, token) => {
    const { data } = await axiosInstance.put(
      `/admin/customers/${id}`,
      formData,
      getHeaders(token)
    );
    return data;
  },
  // Удалить клиента
  delete: async (id, token) => {
    const { data } = await axiosInstance.delete(
      `/admin/customers/${id}`,
      getHeaders(token)
    );
    return data;
  },
};

// === Бренды (Brands) ===
export const brandApi = {
  // Получить все бренды
  getAll: async (token) => {
    const { data } = await axiosInstance.get(
      "/admin/brands",
      getHeaders(token)
    );
    return data;
  },
  // Создать новый бренд
  create: async (formData, token) => {
    const { data } = await axiosInstance.post(
      "/admin/brands",
      formData,
      getHeaders(token)
    );
    return data;
  },
  // Обновить бренд
  update: async ({ id, formData }, token) => {
    const { data } = await axiosInstance.put(
      `/admin/brands/${id}`,
      formData,
      getHeaders(token)
    );
    return data;
  },
  // Удалить бренд
  delete: async (id, token) => {
    const { data } = await axiosInstance.delete(
      `/admin/brands/${id}`,
      getHeaders(token)
    );
    return data;
  },
};

// ===  Промокоды (Coupons) ===
export const couponApi = {
  // Получить все купоны
  getAll: async (token) => {
    const { data } = await axiosInstance.get(
      "/admin/coupons",
      getHeaders(token)
    );
    return data;
  },
  // Создать новый купон
  create: async (formData, token) => {
    const { data } = await axiosInstance.post(
      "/admin/coupons",
      formData,
      getHeaders(token)
    );
    return data;
  },
  // Обновить купон
  update: async ({ id, formData }, token) => {
    const { data } = await axiosInstance.put(
      `/admin/coupons/${id}`,
      formData,
      getHeaders(token)
    );
    return data;
  },
  // Удалить купон
  delete: async (id, token) => {
    const { data } = await axiosInstance.delete(
      `/admin/coupons/${id}`,
      getHeaders(token)
    );
    return data;
  },
  // Включить/Выключить активность
  toggleActive: async (id, token) => {
    const { data } = await axiosInstance.patch(
      `/admin/coupons/${id}/toggle`,
      {},
      getHeaders(token)
    );
    return data;
  },
};

// === Возвраты (Returns) ===
export const returnApi = {
  // Получить все заявки на возврат
  getAll: async (token) => {
    const { data } = await axiosInstance.get(
      "/admin/returns",
      getHeaders(token)
    );
    return data;
  },
  // Обновить статус заявки
  updateStatus: async ({ id, status, adminComment }, token) => {
    const { data } = await axiosInstance.patch(
      `/admin/returns/${id}/status`,
      { status, adminComment },
      getHeaders(token)
    );
    return data;
  },
};

// === Текущий пользователь ===
export const userApi = {
  // Получить профиль текущего юзера
  getMe: async (token) => {
    const { data } = await axiosInstance.get("/users/me", getHeaders(token));
    return data;
  },
};
