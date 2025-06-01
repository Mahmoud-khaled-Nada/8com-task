// api.ts
import { COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from "@/utils/constants";
import {
  ApiResponse,
  ApiResponseWithPagination,
  CartItem,
  CartParams,
  Category,
  CheckoutRequest,
  CheckoutResponse,
  LoginRequest,
  LoginResponse,
  Order,
  Product,
  User,
} from "@/utils/types";
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

const { VITE_API_SERVER_URL, VITE_AUTH_GOOGLE } = import.meta.env;

export const tokenManager = {
  getToken: (): string | null => {
    return Cookies.get("token") || null;
  },

  getRefreshToken: (): string | null => {
    return Cookies.get("refresh_token") || null;
  },

  setTokens: (token: string, refreshToken: string): void => {
    Cookies.set("token", token, COOKIE_OPTIONS);
    Cookies.set("refresh_token", refreshToken, REFRESH_COOKIE_OPTIONS);
  },

  removeTokens: (): void => {
    Cookies.remove("token", { path: "/" });
    Cookies.remove("refresh_token", { path: "/" });
  },

  isTokenExpired: (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: VITE_API_SERVER_URL || "http://localhost:000/api/v1",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
// Response interceptor for automatic token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If unauthorized and this is the first retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh endpoint should read refresh_token from cookie
        await axios.post(
          `${VITE_API_SERVER_URL || "http://localhost:5000/api/v1"}/auth/refresh-token`,
          {},
          {
            withCredentials: true, // ✅ make sure cookies are sent
          }
        );

        // Retry the original request now that token is refreshed (server will re-set auth cookie)
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login if refresh fails
        window.location.href = "/";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Methods
export const authAPI = {
  login: async (credentials: { email: string; password: string }): Promise<ApiResponse> => {
    try {
      const response = await api.post<ApiResponse<User>>("/auth/login", credentials);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }): Promise<ApiResponse> => {
    try {
      const response = await api.post<ApiResponse<User>>("/users/register", userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenManager.removeTokens();
    }
  },

  refreshToken: async (): Promise<ApiResponse> => {
    try {
      const response = await api.post<ApiResponse>("/auth/refresh-token");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get user info");
    }
  },

  getCurrentUser: async ({ signal }): Promise<ApiResponse> => {
    try {
      const response = await api.get<ApiResponse>("/auth/me", { signal });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get user info");
    }
  },
};

export const userAPI = {
  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get user info");
    }
  },

  updateProfile: async (data: { name: string; email: string; avatar: string }) => {
    try {
      const response = await api.post<ApiResponse<User>>(`/users/update-user-profile`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to get user info");
    }
  },
};

export const orderAPI = {
  createCheckoutSession: async (checkoutData: CheckoutRequest): Promise<CheckoutResponse> => {
    try {
      const response = await api.post<CheckoutResponse>("/checkout/create-session", checkoutData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create checkout session");
    }
  },

  confirmOrder: async (sessionId: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await api.post<ApiResponse<Order>>(`/order/confirm/${sessionId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to confirm order");
    }
  },

  getUserOrders: async (): Promise<ApiResponse<Order[]>> => {
    try {
      const response = await api.get<ApiResponse<Order[]>>("/user/orders");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch orders");
    }
  },

  getOrderById: async (orderId: string): Promise<ApiResponse<Order>> => {
    try {
      const response = await api.get<ApiResponse<Order>>(`/order/${orderId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch order");
    }
  },

  getFilteredOrders: async (filters: {
    status?: string;
    paymentStatus?: string;
  }): Promise<ApiResponse<Order[]>> => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.paymentStatus) params.append("paymentStatus", filters.paymentStatus);

      const response = await api.get<ApiResponse<Order[]>>(`/orders/filtered?${params}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch filtered orders");
    }
  },
};

export const categoryAPI = {
  getAllCategories: async (): Promise<Category[]> => {
    try {
      const response = await api.get<Category[]>("/categories");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch categories");
    }
  },

  getCategoryById: async (categoryId: string): Promise<Category> => {
    try {
      const response = await api.get<Category>(`/category/${categoryId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch category");
    }
  },
};

export const productAPI = {
  getAllProducts: async (params: any): Promise<ApiResponseWithPagination<Product[]>> => {
    try {
      const response = await api.get<ApiResponseWithPagination<Product[]>>("/products", { params });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch products");
    }
  },

  getProductById: async (productId: string): Promise<ApiResponse<Product>> => {
    try {
      const response = await api.get<ApiResponse<Product>>(`/product/${productId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch product");
    }
  },

  create: async (productData: Partial<Product>): Promise<ApiResponse<Product>> => {
    try {
      const response = await api.post<ApiResponse<Product>>("/product/create", productData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to create product");
    }
  },
  update: async (productId: string, productData: Partial<Product>): Promise<ApiResponse<Product>> => {
    try {
      const response = await api.put<ApiResponse<Product>>(`/product/${productId}`, productData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to update product");
    }
  },
  delete: async (productId: string): Promise<ApiResponse<Product>> => {
    try {
      const response = await api.delete<ApiResponse<Product>>(`/product/${productId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete product");
    }
  },
};

export const cartAPI = {
  get: async (): Promise<CartItem> => {
    try {
      const response = await api.get<CartItem>("/carts");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch cart items");
    }
  },

  add: async (product: CartParams): Promise<CartItem> => {
    try {
      const response = await api.post<CartItem>("/carts", product);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to add item to cart");
    }
  },

  updateQuantity: async (product: CartParams): Promise<CartItem> => {
    try {
      const response = await api.post<CartItem>("/carts/update-quantity", product);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to add item to cart");
    }
  },

  remove: async (productId: string): Promise<CartItem> => {
    try {
      const response = await api.post<CartItem>(`/remove-from-cart`, { productId });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to remove item from cart");
    }
  },

  empty: async (): Promise<CartItem> => {
    try {
      const response = await api.post<CartItem>(`/carts/empty`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to remove item from cart");
    }
  },
};

//notifications
export const notificationAPI = {
  getAllNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    try {
      const response = await api.get<ApiResponse<Notification[]>>("/notifications");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch notifications");
    }
  },
  
    getAllNotificationsAsAdmin: async (): Promise<ApiResponse<Notification[]>> => {
    try {
      const response = await api.get<ApiResponse<Notification[]>>("/notifications-as-admin");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to fetch notifications");
    }
  },

  markAllAsRead: async (): Promise<ApiResponse<Notification[]>> => {
    try {
      const response = await api.get<ApiResponse<Notification[]>>("/notifications/mark-all-as-read");
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to mark all notifications as read");
    }
  },
  markAsRead: async (id: string): Promise<ApiResponse<Notification>> => {
    try {
      const response = await api.get<ApiResponse<Notification>>(`/notifications/mark-as-read/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to mark notification as read");
    }
  },

  delete: async (id: string): Promise<ApiResponse<Notification>> => {
    try {
      const response = await api.delete<ApiResponse<Notification>>(`/notifications/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Failed to delete notification");
    }
  },
};

// Utility functions
export const isAuthenticated = (): boolean => {
  const token = tokenManager.getToken();
  return token !== null && !tokenManager.isTokenExpired(token);
};

export const getAuthHeaders = (): { Authorization?: string } => {
  const token = tokenManager.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Export default api instance for custom requests
export default api;
