import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (productId: string, size?: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (item) => {
        const state = get();
        const existingItem = state.items.find(
          (i) => i.productId === item.productId && i.size === item.size && i.color === item.color
        );

        if (existingItem) {
          set({
            items: state.items.map((i) =>
              i.productId === item.productId && i.size === item.size && i.color === item.color
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          });
        } else {
          set({
            items: [...state.items, { ...item, id: `${item.productId}-${Date.now()}` }],
          });
        }

        get().getCartTotal();
      },

      removeItem: (productId, size, color) => {
        const state = get();
        set({
          items: state.items.filter(
            (item) => !(item.productId === productId && item.size === size && item.color === color)
          ),
        });
        get().getCartTotal();
      },

      updateQuantity: (productId, quantity, size, color) => {
        if (quantity <= 0) {
          get().removeItem(productId, size, color);
          return;
        }

        const state = get();
        set({
          items: state.items.map((item) =>
            item.productId === productId && item.size === size && item.color === color
              ? { ...item, quantity }
              : item
          ),
        });
        get().getCartTotal();
      },

      clearCart: () => {
        set({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      },

      getCartTotal: () => {
        const state = get();
        const total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const count = state.items.reduce((sum, item) => sum + item.quantity, 0);

        set({
          totalPrice: total,
          totalItems: count,
        });

        return total;
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
