import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CheckoutItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface CheckoutState {
  buyNowItem: CheckoutItem | null;

  setBuyNowItem: (item: CheckoutItem) => void;

  clearBuyNowItem: () => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      buyNowItem: null,

      setBuyNowItem: (item) =>
        set({
          buyNowItem: item,
        }),

      clearBuyNowItem: () =>
        set({
          buyNowItem: null,
        }),
    }),
    {
      name: "buy-now-store",
    },
  ),
);
