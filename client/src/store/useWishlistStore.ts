import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  addedAt: number;
}

interface WishlistState {
  items: WishlistItem[];
  isFavorited: (productId: string) => boolean;
  addToWishlist: (item: Omit<WishlistItem, "addedAt">) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  getWishlistCount: () => number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      isFavorited: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },

      addToWishlist: (item) => {
        const state = get();
        if (!state.isFavorited(item.productId)) {
          set({
            items: [
              ...state.items,
              {
                ...item,
                addedAt: Date.now(),
              },
            ],
          });
        }
      },

      removeFromWishlist: (productId: string) => {
        const state = get();
        set({
          items: state.items.filter((item) => item.productId !== productId),
        });
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      getWishlistCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "wishlist-storage",
    }
  )
);
