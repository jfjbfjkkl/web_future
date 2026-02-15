import type {
  AdminCategory,
  AdminProduct,
  AdminPromotion,
  SiteContentItem,
  SiteSettingItem,
} from "./types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "")
  ?? "http://localhost:8000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string | null;
  body?: unknown;
  isFormData?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const isFormData = Boolean(options.isFormData);
  const response = await fetch(`${API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body
      ? isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body)
      : undefined,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload?.message ?? "Une erreur est survenue";
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const adminApi = {
  baseUrl: API_BASE,
  login: (code: string) => request<{ token: string; expires_in_hours: number }>("/admin/login", {
    method: "POST",
    body: { code },
  }),
  session: (token: string) => request<{ authenticated: boolean }>("/admin/session", { token }),
  logout: (token: string) => request<{ ok: boolean }>("/admin/logout", { method: "POST", token }),

  categories: {
    list: (token: string) => request<AdminCategory[]>("/admin/categories", { token }),
    get: (token: string, id: string | number) => request<AdminCategory>(`/admin/categories/${id}`, { token }),
    create: (token: string, body: Partial<AdminCategory> & { name: string }) =>
      request<AdminCategory>("/admin/categories", { method: "POST", token, body }),
    update: (token: string, id: string | number, body: Partial<AdminCategory> & { name: string; is_active: boolean }) =>
      request<AdminCategory>(`/admin/categories/${id}`, { method: "PUT", token, body }),
    remove: (token: string, id: string | number) =>
      request<{ ok: boolean }>(`/admin/categories/${id}`, { method: "DELETE", token }),
  },

  products: {
    list: (token: string) => request<AdminProduct[]>("/admin/products", { token }),
    get: (token: string, id: string | number) => request<AdminProduct>(`/admin/products/${id}`, { token }),
    create: (
      token: string,
      body: Partial<AdminProduct> & { name: string; base_price: number; category_id: number }
    ) => request<AdminProduct>("/admin/products", { method: "POST", token, body }),
    update: (
      token: string,
      id: string | number,
      body: Partial<AdminProduct> & { name: string; base_price: number; category_id: number; is_active: boolean }
    ) => request<AdminProduct>(`/admin/products/${id}`, { method: "PUT", token, body }),
    remove: (token: string, id: string | number) =>
      request<{ ok: boolean }>(`/admin/products/${id}`, { method: "DELETE", token }),
  },

  promotions: {
    list: (token: string) => request<AdminPromotion[]>("/admin/promotions", { token }),
    create: (token: string, body: Partial<AdminPromotion> & { name: string; scope_type: "product" | "category"; scope_id: number }) =>
      request<AdminPromotion>("/admin/promotions", { method: "POST", token, body }),
    update: (
      token: string,
      id: string | number,
      body: Partial<AdminPromotion> & { name: string; scope_type: "product" | "category"; scope_id: number; is_active: boolean }
    ) => request<AdminPromotion>(`/admin/promotions/${id}`, { method: "PUT", token, body }),
    remove: (token: string, id: string | number) =>
      request<{ ok: boolean }>(`/admin/promotions/${id}`, { method: "DELETE", token }),
  },

  content: {
    list: (token: string) => request<SiteContentItem[]>("/admin/content", { token }),
    upsert: (
      token: string,
      items: Array<Pick<SiteContentItem, "key" | "value" | "content_type" | "is_active">>
    ) => request<SiteContentItem[]>("/admin/content", { method: "PUT", token, body: { items } }),
  },
  settings: {
    list: (token: string) => request<SiteSettingItem[]>("/admin/settings", { token }),
    upsert: (
      token: string,
      items: Array<Pick<SiteSettingItem, "key" | "value" | "is_public">>
    ) => request<SiteSettingItem[]>("/admin/settings", { method: "PUT", token, body: { items } }),
  },
  uploadImage: async (token: string, file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<{ url: string }>("/admin/upload", { method: "POST", token, body: form, isFormData: true });
  },
};
