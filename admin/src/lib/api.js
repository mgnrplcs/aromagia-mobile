import axiosInstance from "./axios";

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

export const productApi = {
  getAll: async (token) => {
    const { data } = await axiosInstance.get(
      "/admin/products",
      getHeaders(token)
    );
    return data;
  },
  create: async (formData, token) => {
    const { data } = await axiosInstance.post(
      "/admin/products",
      formData,
      getHeaders(token)
    );
    return data;
  },
  update: async ({ id, formData }, token) => {
    const { data } = await axiosInstance.put(
      `/admin/products/${id}`,
      formData,
      getHeaders(token)
    );
    return data;
  },
  delete: async (id, token) => {
    const { data } = await axiosInstance.delete(
      `/admin/products/${id}`,
      getHeaders(token)
    );
    return data;
  },
};

export const orderApi = {
  getAll: async (token) => {
    const { data } = await axiosInstance.get(
      "/admin/orders",
      getHeaders(token)
    );
    return data;
  },
  updateStatus: async ({ orderId, status }, token) => {
    const { data } = await axiosInstance.patch(
      `/admin/orders/${orderId}/status`,
      { status },
      getHeaders(token)
    );
    return data;
  },
};

export const statsApi = {
  getDashboard: async (token) => {
    const { data } = await axiosInstance.get("/admin/stats", getHeaders(token));
    return data;
  },
};

export const customerApi = {
  getAll: async (token) => {
    const { data } = await axiosInstance.get(
      "/admin/customers",
      getHeaders(token)
    );
    return data;
  },
  update: async ({ id, formData }, token) => {
    const { data } = await axiosInstance.put(
      `/admin/customers/${id}`,
      formData,
      getHeaders(token)
    );
    return data;
  },
  delete: async (id, token) => {
    const { data } = await axiosInstance.delete(
      `/admin/customers/${id}`,
      getHeaders(token)
    );
    return data;
  },
};

export const brandApi = {
  getAll: async (token) => {
    const { data } = await axiosInstance.get(
      "/admin/brands",
      getHeaders(token)
    );
    return data;
  },
  create: async (formData, token) => {
    const { data } = await axiosInstance.post(
      "/admin/brands",
      formData,
      getHeaders(token)
    );
    return data;
  },
  update: async ({ id, formData }, token) => {
    const { data } = await axiosInstance.put(
      `/admin/brands/${id}`,
      formData,
      getHeaders(token)
    );
    return data;
  },
  delete: async (id, token) => {
    const { data } = await axiosInstance.delete(
      `/admin/brands/${id}`,
      getHeaders(token)
    );
    return data;
  },
};

export const userApi = {
  getMe: async (token) => {
    const { data } = await axiosInstance.get("/users/me", getHeaders(token));
    return data;
  },
};
