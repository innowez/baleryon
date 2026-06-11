import { create } from "zustand";

interface BuyNowItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface BuyNowState {
  item: BuyNowItem | null;
  setItem: (item: BuyNowItem) => void;
  clear: () => void;
}

export const useBuyNowStore = create<BuyNowState>((set) => ({
  item: null,

  setItem: (item) =>
    set({
      item,
    }),

  clear: () =>
    set({
      item: null,
    }),
}));