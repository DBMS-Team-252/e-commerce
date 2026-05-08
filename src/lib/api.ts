/**
 * API Client với auto-refresh token interceptor.
 *
 * Flow:
 * 1. Mỗi request gửi kèm accessToken (nếu có).
 * 2. Nếu server trả 401 → gọi /auth/refresh để lấy accessToken mới.
 * 3. Retry request gốc với accessToken mới.
 * 4. Nếu refresh cũng fail → xóa token, redirect về /signin.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// ─── Token helpers (chỉ dùng được phía client) ───────────────────────────────

export const getTokens = () => {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
};

export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

// ─── Refresh helper ───────────────────────────────────────────────────────────

let isRefreshing = false;
let pendingQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  pendingQueue = [];
};

const doRefresh = async (): Promise<string> => {
  const { refreshToken } = getTokens();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) throw new Error("Refresh failed");

  const data = await res.json();
  const newAccess: string = data.data?.accessToken ?? data.accessToken;
  // Giữ lại refreshToken cũ, chỉ cập nhật accessToken
  const { refreshToken: oldRefresh } = getTokens();
  setTokens(newAccess, oldRefresh!);
  return newAccess;
};

// ─── Core fetch wrapper ───────────────────────────────────────────────────────

type FetchOptions = RequestInit & { _retry?: boolean };

export const apiFetch = async (endpoint: string, options: FetchOptions = {}): Promise<Response> => {
  const { accessToken } = getTokens();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // Nếu 401 và chưa retry → thử refresh
  if (response.status === 401 && !options._retry) {
    if (isRefreshing) {
      // Có request khác đang refresh → chờ
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            headers["Authorization"] = `Bearer ${token}`;
            resolve(fetch(`${BASE_URL}${endpoint}`, { ...options, headers }));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await doRefresh();
      processQueue(null, newToken);
      headers["Authorization"] = `Bearer ${newToken}`;
      response = await fetch(`${BASE_URL}${endpoint}`, { ...options, _retry: true, headers } as FetchOptions);
    } catch (err) {
      processQueue(err, null);
      clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/signin";
      }
      throw err;
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};

// ─── Auth API ─────────────────────────────────────────────────────────────────

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; name: string; email: string; role: string };
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Đăng nhập thất bại");
    // BE trả { data: { accessToken, refreshToken, user } }
    return json.data ?? json;
  },

  register: async (name: string, email: string, phone: string, password: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Đăng ký thất bại");
    return json.data ?? json;
  },

  logout: async (): Promise<void> => {
    const { refreshToken } = getTokens();
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken }),
      });
    } finally {
      clearTokens();
    }
  },
};

// ─── Products API ─────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string | null;
  created_at: string;
  category: { id: string; name: string } | null;
}

export interface ProductsQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface PaginatedProducts {
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

export const productApi = {
  getProducts: async (query: ProductsQuery = {}): Promise<PaginatedProducts> => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.search) params.set("search", query.search);
    if (query.category) params.set("category", query.category);
    if (query.minPrice !== undefined) params.set("minPrice", String(query.minPrice));
    if (query.maxPrice !== undefined) params.set("maxPrice", String(query.maxPrice));

    const res = await apiFetch(`/products?${params.toString()}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Lỗi tải sản phẩm");

    const payload = json.data ?? json;
    return {
      data: payload.data ?? [],
      pagination: {
        page: payload.pagination?.currentPage ?? payload.pagination?.page ?? 1,
        limit: payload.pagination?.pageSize ?? payload.pagination?.limit ?? 12,
        totalItems: payload.pagination?.totalItems ?? 0,
        totalPages: payload.pagination?.totalPages ?? 1,
      },
    };
  },
};

// ─── Categories API ───────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const res = await apiFetch("/categories");
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || "Lỗi tải danh mục");
    return json.data ?? json;
  },
};


