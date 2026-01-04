import axiosInstance from "./axios";

// Вспомогательная функция для конфига заголовков
const getHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const productApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get(
      "/admin/products",
      getHeaders(token)
    );
    return data;
  },

  create: async (formData) => {
    const { data } = await axiosInstance.post(
      "/admin/products",
      formData,
      getHeaders(token)
    );
    return data;
  },

  update: async ({ id, formData }) => {
    const { data } = await axiosInstance.put(
      `/admin/products/${id}`,
      formData,
      getHeaders(token)
    );
    return data;
  },
};

export const orderApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get(
      "/admin/orders",
      getHeaders(token)
    );
    return data;
  },

  updateStatus: async ({ orderId, status }) => {
    const { data } = await axiosInstance.patch(
      `/admin/orders/${orderId}/status`,
      { status },
      getHeaders(token)
    );
    return data;
  },
};

export const statsApi = {
  getDashboard: async () => {
    const { data } = await axiosInstance.get("/admin/stats", getHeaders(token));
    return data;
  },
};

export const customerApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get(
      "/admin/customers",
      getHeaders(token)
    );
    return data;
  },
};
