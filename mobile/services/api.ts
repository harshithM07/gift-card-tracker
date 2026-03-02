import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/constants/api";
import { tokenStorage } from "@/services/secureStore";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

// Attach access token to every request
apiClient.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, attempt token refresh once
let isRefreshing = false;
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers!.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();
        if (!refreshToken) throw new Error("No refresh token");

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        await tokenStorage.saveTokens(data.access_token, data.refresh_token);
        processQueue(null, data.access_token);
        originalRequest.headers!.Authorization = `Bearer ${data.access_token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await tokenStorage.clearTokens();
        // Signal the app to show the login screen
        // (handled via Zustand auth store listener)
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── API functions ────────────────────────────────────────────────────────────

export const authApi = {
  register: (email: string, password: string) =>
    apiClient.post("/auth/register", { email, password }),
  login: (email: string, password: string) =>
    apiClient.post("/auth/login", { email, password }),
  logout: (refreshToken: string) =>
    apiClient.post("/auth/logout", { refresh_token: refreshToken }),
  me: () => apiClient.get("/auth/me"),
};

export const merchantsApi = {
  list: () => apiClient.get("/merchants"),
};

export const cardsApi = {
  list: (includeArchived = false) =>
    apiClient.get("/cards", { params: { include_archived: includeArchived } }),
  get: (id: string) => apiClient.get(`/cards/${id}`),
  create: (data: {
    merchant_id: string;
    card_number: string;
    pin?: string;
    nickname?: string;
    notes?: string;
    initial_balance?: number;
  }) => apiClient.post("/cards", data),
  update: (
    id: string,
    data: { nickname?: string; notes?: string; balance?: number; is_archived?: boolean }
  ) => apiClient.patch(`/cards/${id}`, data),
  delete: (id: string) => apiClient.delete(`/cards/${id}`),
  checkBalance: (id: string) => apiClient.post(`/cards/${id}/check-balance`),
  updateBalance: (id: string, balance: number) =>
    apiClient.post(`/cards/${id}/update-balance`, { balance }),
};

export const scanApi = {
  scanImage: (formData: FormData) =>
    apiClient.post("/scan", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const adminApi = {
  listMerchants: () => apiClient.get("/admin/merchants"),
  createMerchant: (data: object) => apiClient.post("/admin/merchants", data),
  updateMerchant: (id: string, data: object) => apiClient.patch(`/admin/merchants/${id}`, data),
  deleteMerchant: (id: string) => apiClient.delete(`/admin/merchants/${id}`),
};
