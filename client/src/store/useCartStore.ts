"use client";

import { create } from "zustand";
import { cartApi, CartApiError, type CartItem } from "@/lib/cartApi";

const KEY = "guest-cart-v1";

export type Mode = "unknown" | "guest" | "user";

export type ActionResult = { ok: true } | { ok: false; message: string };

export type AddItemInput = Omit<
  CartItem,
  "id" | "quantity" | "stock" | "needsSize" | "needsColor"
> & {
  quantity?: number;
  needsSize?: boolean;
  needsColor?: boolean;
};

const normalized = (s?: string) => (s ?? "").trim().toLowerCase();

const normalizedColor = (s?: string) =>
  normalized(s) === "default" ? "" : normalized(s);

export const stockKey = (i: Pick<CartItem, "productId" | "size" | "color">) =>
  `${i.productId}::${normalized(i.size)}::${normalizedColor(i.color)}`;

function readGuest(): CartItem[] {
  if (typeof window === "undefined") return [];

  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (x): x is CartItem =>
        !!x &&
        typeof x === "object" &&
        typeof x.id === "string" &&
        typeof x.productId === "string" &&
        typeof x.quantity === "number" &&
        Number.isSafeInteger(x.quantity) &&
        x.quantity >= 1,
    );
  } catch {
    return [];
  }
}

function writeGuest(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(items));
  }
}

export function clearGuestCartStorage() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
  }
}

const message = (e: unknown) =>
  e instanceof Error ? e.message : "Cart operation failed.";

const invalidQuantity = (q: number) => !Number.isSafeInteger(q) || q < 0;

const optionError = (i: CartItem) => {
  const missing = [
    i.needsSize && !normalized(i.size) ? "size" : "",
    i.needsColor && !normalizedColor(i.color) ? "color" : "",
  ].filter(Boolean);

  return missing.length ? `Please select a ${missing.join(" and ")}.` : null;
};

let revision = 0;

interface CartState {
  items: CartItem[];
  mode: Mode;
  ready: boolean;
  syncing: boolean;
  error: string | null;
  totalItems: number;
  totalPrice: number;

  initialize: () => Promise<void>;
  setSession: (isLoggedIn: boolean) => Promise<void>;
  refresh: () => Promise<void>;
  addItem: (item: AddItemInput) => Promise<ActionResult>;

  updateQuantity: (
    productId: string,
    qty: number,
    size?: string,
    color?: string,
  ) => Promise<ActionResult>;

  removeItem: (
    productId: string,
    size?: string,
    color?: string,
  ) => Promise<ActionResult>;

  clearCart: () => Promise<ActionResult>;
}

const totals = (items: CartItem[]) => ({
  items,
  totalItems: items.reduce((n, i) => n + i.quantity, 0),
  totalPrice: items.reduce((n, i) => n + i.quantity * i.price, 0),
});

export const useCartStore = create<CartState>((set, get) => {
  const apply = (items: CartItem[]) => set({ ...totals(items) });

  const withServer = async (
    operation: () => Promise<{ items: CartItem[] }>,
  ): Promise<ActionResult> => {
    const token = revision;

    set({ syncing: true, error: null });

    try {
      const result = await operation();

      if (token !== revision || get().mode !== "user") {
        return {
          ok: false,
          message: "Cart session changed.",
        };
      }

      apply(result.items);
      return { ok: true };
    } catch (e) {
      if (token === revision) {
        set({ error: message(e) });
      }

      return {
        ok: false,
        message: message(e),
      };
    } finally {
      if (token === revision) {
        set({ syncing: false });
      }
    }
  };

  let initializing: Promise<void> | null = null;

  return {
    ...totals([]),
    mode: "unknown",
    ready: false,
    syncing: false,
    error: null,

    initialize: () => {
      if (get().mode !== "unknown" || get().ready) {
        return Promise.resolve();
      }

      if (initializing) return initializing;

      const token = revision;

      set({
        syncing: true,
        error: null,
      });

      const task = (async () => {
        try {
          const result = await cartApi.get();

          if (token !== revision) return;

          clearGuestCartStorage();

          set({
            ...totals(result.items),
            mode: "user",
            ready: true,
            error: null,
          });
        } catch (e) {
          if (token !== revision) return;

          if (e instanceof CartApiError && e.status === 401) {
            set({
              ...totals(readGuest()),
              mode: "guest",
              ready: true,
              error: null,
            });
          } else {
            const detail =
              e instanceof CartApiError
                ? `GET /api/cart returned HTTP ${e.status}: ${e.message}`
                : `GET /api/cart failed: ${message(e)}`;

            console.error("[Cart initialization]", detail, e);

            set({
              mode: "unknown",
              ready: false,
              error: detail,
            });
          }
        } finally {
          if (token === revision) {
            set({ syncing: false });
          }
        }
      })();

      initializing = task.finally(() => {
        initializing = null;
      });

      return initializing;
    },

    setSession: async (isLoggedIn) => {
      const nextMode: Mode = isLoggedIn ? "user" : "guest";

      const previous = get().mode;

      if (previous === nextMode && get().ready) {
        return;
      }

      const token = ++revision;

      if (previous !== "unknown" || isLoggedIn) {
        clearGuestCartStorage();
      }

      const initialGuestItems =
        !isLoggedIn && previous === "unknown" ? readGuest() : [];

      set({
        ...totals(initialGuestItems),
        mode: nextMode,
        ready: false,
        syncing: isLoggedIn,
        error: null,
      });

      if (!isLoggedIn) {
        if (token === revision) {
          set({
            ready: true,
            syncing: false,
          });
        }
        return;
      }

      try {
        const result = await cartApi.get();

        if (token === revision) {
          set({
            ...totals(result.items),
            ready: true,
            error: null,
          });
        }
      } catch (e) {
        if (token === revision) {
          set({
            error: message(e),
            ready: false,
          });
        }
      } finally {
        if (token === revision) {
          set({ syncing: false });
        }
      }
    },

    refresh: async () => {
      const { mode } = get();

      if (mode === "unknown") {
        await get().initialize();
        return;
      }

      const token = revision;

      if (mode === "user") {
        await withServer(cartApi.get);
        return;
      }

      const snapshot = get().items;

      if (!snapshot.length) return;

      set({
        syncing: true,
        error: null,
      });

      try {
        const result = await cartApi.checkStock(snapshot);

        if (token !== revision || get().mode !== "guest") {
          return;
        }

        const updated = snapshot.map((item, index) => ({
          ...item,
          stock: result.items[index]?.stock ?? 0,
          needsSize: result.items[index]?.needsSize ?? item.needsSize,
          needsColor: result.items[index]?.needsColor ?? item.needsColor,
        }));

        writeGuest(updated);
        apply(updated);
      } catch (e) {
        if (token === revision) {
          set({ error: message(e) });
        }
      } finally {
        if (token === revision) {
          set({ syncing: false });
        }
      }
    },

    addItem: async (input) => {
      const { mode, ready } = get();

      if (!ready || mode === "unknown") {
        return {
          ok: false,
          message: "Cart is still initializing.",
        };
      }

      const qty = input.quantity ?? 1;

      if (!Number.isSafeInteger(qty) || qty < 1) {
        return {
          ok: false,
          message: "Invalid quantity.",
        };
      }

      const missing = [
        input.needsSize && !normalized(input.size) ? "size" : "",
        input.needsColor && !normalizedColor(input.color) ? "color" : "",
      ].filter(Boolean);

      if (missing.length) {
        return {
          ok: false,
          message: `Please select a ${missing.join(" and ")}.`,
        };
      }

      if (mode === "user") {
        return withServer(() =>
          cartApi.add({
            productId: input.productId,
            size: input.size,
            color: input.color,
            quantity: qty,
          }),
        );
      }

      // Guest stock is validated against backend.
      try {
        const result = await cartApi.checkStock([
          {
            productId: input.productId,
            size: input.size,
            color: input.color,
          },
        ]);

        const variant = result.items[0];

        if (!variant?.found) {
          return {
            ok: false,
            message: "This size and color combination is unavailable.",
          };
        }

        const id = stockKey(input);

        const old = get().items.find((i) => i.id === id);

        const nextQty = (old?.quantity ?? 0) + qty;

        if (nextQty > variant.stock) {
          return {
            ok: false,
            message:
              variant.stock <= 0
                ? "This item is out of stock."
                : `Only ${variant.stock} available.`,
          };
        }

        const added: CartItem = {
          ...input,
          id,
          quantity: nextQty,
          stock: variant.stock,
        };

        const items = old
          ? get().items.map((i) =>
              i.id === id
                ? {
                    ...i,
                    quantity: nextQty,
                    stock: variant.stock,
                  }
                : i,
            )
          : [...get().items, added];

        if (get().mode !== "guest") {
          return {
            ok: false,
            message: "Cart session changed.",
          };
        }

        writeGuest(items);
        apply(items);

        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          message: message(e),
        };
      }
    },

    updateQuantity: async (productId, qty, size, color) => {
      if (invalidQuantity(qty)) {
        return {
          ok: false,
          message: "Invalid quantity.",
        };
      }

      const { mode, items, ready } = get();

      if (!ready) {
        return {
          ok: false,
          message: "Cart is still initializing.",
        };
      }

      const found = items.find(
        (i) =>
          stockKey(i) ===
          stockKey({
            productId,
            size,
            color,
          }),
      );

      if (!found) {
        return {
          ok: false,
          message: "Cart item not found.",
        };
      }

      if (mode === "user") {
        return withServer(() => cartApi.update(found.id, qty));
      }

      if (qty > 0) {
        const error = optionError(found);

        if (error) {
          return {
            ok: false,
            message: error,
          };
        }

        try {
          const result = await cartApi.checkStock([found]);
          const available = result.items[0]?.stock ?? 0;

          if (qty > available) {
            return {
              ok: false,
              message:
                available === 0
                  ? "This item is out of stock."
                  : `Only ${available} available.`,
            };
          }
        } catch (e) {
          return {
            ok: false,
            message: message(e),
          };
        }
      }

      if (get().mode !== "guest") {
        return {
          ok: false,
          message: "Cart session changed.",
        };
      }

      const updated =
        qty === 0
          ? get().items.filter((i) => i.id !== found.id)
          : get().items.map((i) =>
              i.id === found.id ? { ...i, quantity: qty } : i,
            );

      writeGuest(updated);
      apply(updated);

      return { ok: true };
    },

    removeItem: async (productId, size, color) => {
      const item = get().items.find(
        (i) =>
          stockKey(i) ===
          stockKey({
            productId,
            size,
            color,
          }),
      );

      if (!item) {
        return {
          ok: false,
          message: "Cart item not found.",
        };
      }

      if (get().mode === "user") {
        return withServer(() => cartApi.remove(item.id));
      }

      if (get().mode !== "guest") {
        return {
          ok: false,
          message: "Cart is not initialized.",
        };
      }

      const updated = get().items.filter((i) => i.id !== item.id);

      writeGuest(updated);
      apply(updated);

      return { ok: true };
    },

    resetGuestCart: () => {
      clearGuestCartStorage();

      // Invalidate in-flight cart API requests.
      ++revision;

      set({
        ...totals([]),
        mode: "guest",
        ready: true,
        syncing: false,
        error: null,
      });
    },
    clearCart: async () => {
      if (get().mode === "user") {
        return withServer(cartApi.clear);
      }

      if (get().mode !== "guest") {
        return {
          ok: false,
          message: "Cart is not initialized.",
        };
      }

      clearGuestCartStorage();
      apply([]);

      return { ok: true };
    },
  };
});

export const setCartAuthenticated = (isLoggedIn: boolean) =>
  useCartStore.getState().setSession(isLoggedIn);
