// types/category.ts

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  _count: {
    products: number;
  };
}

export interface CategoriesResponse {
  categories: Category[];
}


export interface LimitedSeason {
  id: string;
  mainContent: string | null;
  description: string | null;
  timeCountingHours: number;
  ctaLink: string | null;
  backgroundImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LimitedSeasonResponse {
  season: LimitedSeason;
}