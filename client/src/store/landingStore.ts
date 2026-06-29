import {
  fetchActiveBanner,
  fetchActiveLimitedSeason,
  fetchCategories,
  joinCommunity,
  // fetchInstagramPosts,
} from "@/lib/landingApis";
import {
  Banner,
  Category,
  InstagramPost,
  LimitedSeason,
} from "@/types/landinTypes";
import { create } from "zustand";

interface LandingStore {
  categories: Category[];
  season: LimitedSeason | null;
  banner: Banner | null;
  instagramPosts: InstagramPost[];

  loading: boolean;
  error: string | null;
  success: boolean;

  getCategories: () => Promise<void>;
  getSeason: () => Promise<void>;
  getBanner: () => Promise<void>;
  subscribe: (email: string) => Promise<void>;

  // getInstagramPosts: () => Promise<void>;
}

export const useLandingStore = create<LandingStore>((set) => ({
  categories: [],
  instagramPosts: [],
  season: null,
  banner: null,

  loading: false,
  error: null,
  success: false,

  getCategories: async () => {
    try {
      set({ loading: true, error: null });

      const data = await fetchCategories();

      set({
        categories: data.categories,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to load categories",
      });
    }
  },

  getSeason: async () => {
    try {
      set({ loading: true, error: null });

      const data = await fetchActiveLimitedSeason();

      set({
        season: data.season,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to load promotion",
      });
    }
  },

  getBanner: async () => {
    try {
      set({ loading: true, error: null });

      const data = await fetchActiveBanner();

      set({
        banner: data.banner,
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load banner",
      });
    }
  },

  // getInstagramPosts: async () => {
  //   const data = await fetchInstagramPosts();

  //   set({
  //     instagramPosts: data.posts,
  //   });
  // },

  subscribe: async (email: string) => {
    try {
      set({
        loading: true,
        error: null,
        success: false,
      });

      await joinCommunity(email);

      set({
        loading: false,
        success: true,
      });
    } catch (error) {
      set({
       loading: false,
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Something went wrong",
      });
    }
  },
}));
