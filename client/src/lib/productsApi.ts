import { apiFetch } from "@/lib/api";
import type {
  FilterState,
  Product,
  ShopFilterOptions,
  ShopProductsResponse,
  SortOption,
} from "@/types/product";

type ListProductsParams = {
  page: number;
  limit: number;
  sort: SortOption;
  search: string;
  filters: FilterState;
  gender?: string;
};

function buildQuery(params: ListProductsParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("page", String(params.page));
  searchParams.set("limit", String(params.limit));
  searchParams.set("sort", params.sort);
  searchParams.set("gender", params.gender || "men");

  if (params.search.trim()) {
    searchParams.set("search", params.search.trim());
  }
  if (params.filters.categories.length) {
    searchParams.set("categories", params.filters.categories.join(","));
  }
  if (params.filters.colors.length) {
    searchParams.set("colors", params.filters.colors.join(","));
  }
  if (params.filters.sizes.length) {
    searchParams.set("sizes", params.filters.sizes.join(","));
  }
  if (params.filters.priceMin > 0) {
    searchParams.set("minPrice", String(params.filters.priceMin));
  }
  if (params.filters.rating > 0) {
    searchParams.set("rating", String(params.filters.rating));
  }
  if (params.filters.priceMax > 0) {
    searchParams.set("maxPrice", String(params.filters.priceMax));
  }

  return searchParams.toString();
}

export async function fetchShopProducts(
  params: ListProductsParams
): Promise<ShopProductsResponse> {
  const query = buildQuery(params);
  return apiFetch<ShopProductsResponse>(`/api/shop/products?${query}`);
}

export async function fetchShopFilterOptions(
  gender = "men"
): Promise<ShopFilterOptions> {
  return apiFetch<ShopFilterOptions>(
    `/api/shop/products/filters?gender=${encodeURIComponent(gender)}`
  );
}

export async function fetchShopProductById(id: string): Promise<Product> {
  const data = await apiFetch<{ product: Product }>(`/api/shop/products/${id}`);
  return data.product;
}

export async function fetchRelatedShopProducts(
  category: string,
  excludeId: string,
  limit = 4
): Promise<Product[]> {
  const searchParams = new URLSearchParams({
    gender: "men",
    categories: category,
    limit: String(limit + 1),
    page: "1",
    sort: "relevance",
  });

  const data = await apiFetch<ShopProductsResponse>(
    `/api/shop/products?${searchParams.toString()}`
  );

  return data.products.filter((p) => p.id !== excludeId).slice(0, limit);
}
