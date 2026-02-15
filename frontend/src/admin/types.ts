export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  is_active: boolean;
  sort_order?: number;
};

export type AdminProduct = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  currency: string;
  is_active: boolean;
  sort_order: number;
  category_id: number;
  category?: Pick<AdminCategory, "id" | "name" | "slug" | "is_active">;
};

export type AdminPromotion = {
  id: number;
  name: string;
  scope_type: "product" | "category";
  scope_id: number;
  discount_type?: "percent" | "fixed" | null;
  discount_value?: number | null;
  discount_percent: number | null;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
};

export type SiteSettingItem = {
  id: number;
  key: string;
  value: string | null;
  is_public: boolean;
};

export type SiteContentItem = {
  id: number;
  key: string;
  value: string | null;
  content_type: "text" | "image";
  is_active: boolean;
};
