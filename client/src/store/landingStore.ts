import { fetchActiveLimitedSeason, fetchCategories } from "@/lib/landingApis";
import { Category, LimitedSeason } from "@/types/landinTypes";
import { create } from "zustand";

interface LandingStore {
  categories: Category[];
  season: LimitedSeason | null;

  loading: boolean;
  error: string | null;

  getCategories: () => Promise<void>;
  getSeason: () => Promise<void>;
}

export const useLandingStore = create<LandingStore>((set) => ({
  categories: [],
  season: null,

  loading: false,
  error: null,

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
          error instanceof Error
            ? error.message
            : "Failed to load categories",
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
          error instanceof Error
            ? error.message
            : "Failed to load promotion",
      });
    }
  },
}));