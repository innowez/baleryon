export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  images: string[];
  image: string;
  image2: string;
  rating: number;
  reviews: number;
  description: string;
  sizes: string[];
  colors: string[];
  inStock: boolean;
  slug?: string;
  gender?: string | null;
}

export type SortOption =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "newest"
  | "best-rated"
  | "popularity";

export type FilterState = {
  categories: string[];
  priceMin: number;
  priceMax: number;
  rating: number;
  colors: string[];
  sizes: string[];
};

export type ShopColorOption = {
  name: string;
  hex: string | null;
};

export type ShopFilterOptions = {
  categories: string[];
  colors: ShopColorOption[];
  sizes: string[];
  priceRange: {
    min: number;
    max: number;
  };
};

export type ShopProductsResponse = {
  products: Product[];
  page: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
};
