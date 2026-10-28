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

export interface Banner {
  id: string;
  imageUrl: string;
  topContent: string;
  mainContent: string;
  lastContent: string;
  shopNowLink: string;
  isActive: boolean;
}

export interface InstagramPost {
  id: string;
  image: string;
  mediaType: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  permalink: string;
  caption: string;
  timestamp: string;
  likes: number | null;
  comments: number | null;
}


export interface LandingStore {
  instagramPosts: InstagramPost[];
  getInstagramPosts: () => Promise<void>;
}



export interface UrbanStory {
  id: string;
  category: string;
  ctaLink: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UrbanStoriesResponse {
  urbanStories: UrbanStory[];
}
